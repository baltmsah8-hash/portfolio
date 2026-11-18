import { NextRequest } from "next/server";
import { POST as sendAdminMessage } from "@/src/app/api/chat/admin/route";
import { GET as cleanupOldMessages } from "@/src/app/api/cron/cleanup/route";
import { GET as getChat } from "@/src/app/api/chat/route";
import { PATCH as pinMessage } from "@/src/app/api/chat/pin/route";
import { PATCH as markAsRead } from "@/src/app/api/chat/read/route";
import { POST as sendUserMessage } from "@/src/app/api/chat/user/route";
import { ChatModel } from "@/src/models/chat.model";
import { pusherServer } from "@/src/lib/pusher";
import { sendWebPushToUsers } from "@/src/lib/web-push";

jest.mock("@/src/lib/db", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/src/models/chat.model", () => ({
  ChatModel: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ unreadCount: 1, messages: [] }),
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    }),
    updateMany: jest.fn(),
  },
}));

jest.mock("@/src/lib/pusher", () => ({
  pusherServer: {
    trigger: jest.fn().mockResolvedValue(undefined),
  },
  pusherClient: {},
}));

jest.mock("@/src/lib/web-push", () => ({
  sendWebPushToUsers: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/src/models/user.model", () => ({
  UserModel: {
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue({ name: "Test User" }) }),
    }),
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: "admin-1" }]) }),
    }),
  },
}));

function createRequest(
  method: string,
  url: string,
  body?: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe("Chat API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("stores and broadcasts a message sent by an authenticated user", async () => {
    const response = await sendUserMessage(
      createRequest(
        "POST",
        "http://localhost/api/chat/user",
        { content: "Hello, this is a message" },
        { "x-user-id": "user-1" },
      ),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      message: {
        sender: "user",
        content: "Hello, this is a message",
        isReaded: false,
      },
    });
    expect(body.message.id).toEqual(expect.any(String));
    expect(ChatModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user-1" },
      {
        $push: {
          messages: expect.objectContaining({
            id: body.message.id,
            sender: "user",
            content: "Hello, this is a message",
            isReaded: false,
          }),
        },
        $inc: { unreadCount: 1 },
      },
      { new: true, upsert: true },
    );
    expect(pusherServer.trigger).toHaveBeenCalledWith("chat-user-1", "new-message", {
      sender: "user",
      message: expect.objectContaining({
        id: body.message.id,
        content: "Hello, this is a message",
        sender: "user",
        isReaded: false,
      }),
    });
    expect(sendWebPushToUsers).toHaveBeenCalledWith(
      ["admin-1"],
      expect.objectContaining({
        title: expect.stringContaining("New message"),
        body: "Hello, this is a message",
        url: "/ar/chat?userId=user-1",
        chatId: "user-1",
      }),
    );
  });

  it("rejects user messages when the user ID is missing or content is invalid", async () => {
    const missingIdentity = await sendUserMessage(
      createRequest("POST", "http://localhost/api/chat/user", {
        content: "Hello, this is a message",
      }),
    );
    expect(missingIdentity.status).toBe(401);

    const invalidMessage = await sendUserMessage(
      createRequest(
        "POST",
        "http://localhost/api/chat/user",
        { content: "bad" },
        { "x-user-id": "user-1" },
      ),
    );
    expect(invalidMessage.status).toBe(400);
    expect(ChatModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("requires an admin to send a message on behalf of a user", async () => {
    const forbidden = await sendAdminMessage(
      createRequest("POST", "http://localhost/api/chat/admin", {
        userId: "user-1",
        content: "An admin reply to this user",
      }),
    );
    expect(forbidden.status).toBe(403);

    const response = await sendAdminMessage(
      createRequest(
        "POST",
        "http://localhost/api/chat/admin",
        { userId: "user-1", content: "An admin reply to this user" },
        { "x-user-role": "admin" },
      ),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toMatchObject({
      sender: "admin",
      content: "An admin reply to this user",
      isReaded: false,
    });
    expect(ChatModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user-1" },
      {
        $push: {
          messages: expect.objectContaining({
            id: body.message.id,
            sender: "admin",
            content: "An admin reply to this user",
            isReaded: false,
          }),
        },
      },
      { new: true, upsert: true },
    );
    expect(pusherServer.trigger).toHaveBeenCalledWith("chat-user-1", "new-message", {
      sender: "admin",
      message: expect.objectContaining({
        id: body.message.id,
        content: "An admin reply to this user",
        sender: "admin",
        isReaded: false,
      }),
    });
    expect(sendWebPushToUsers).toHaveBeenCalledWith(
      ["user-1"],
      expect.objectContaining({
        title: "New message from admin",
        body: "An admin reply to this user",
        url: "/ar/chat",
        chatId: "user-1",
      }),
    );
  });

  it("marks user messages as read for admins and admin messages for users", async () => {
    const adminResponse = await markAsRead(
      createRequest(
        "PATCH",
        "http://localhost/api/chat/read",
        { userId: "user-1" },
        { "x-user-role": "admin" },
      ),
    );
    expect(adminResponse.status).toBe(200);
    expect(ChatModel.findOneAndUpdate).toHaveBeenLastCalledWith(
      { userId: "user-1" },
      { $set: { "messages.$[msg].isReaded": true, unreadCount: 0 } },
      { arrayFilters: [{ "msg.sender": "user", "msg.isReaded": false }] },
    );

    const userResponse = await markAsRead(
      createRequest(
        "PATCH",
        "http://localhost/api/chat/read",
        {},
        { "x-user-id": "user-1", "x-user-role": "user" },
      ),
    );
    expect(userResponse.status).toBe(200);
    expect(ChatModel.findOneAndUpdate).toHaveBeenLastCalledWith(
      { userId: "user-1" },
      { $set: { "messages.$[msg].isReaded": true } },
      { arrayFilters: [{ "msg.sender": "admin", "msg.isReaded": false }] },
    );
  });

  it("rejects read updates without a user ID", async () => {
    const response = await markAsRead(
      createRequest("PATCH", "http://localhost/api/chat/read", {}),
    );

    expect(response.status).toBe(400);
    expect(ChatModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("allows admins to pin or unpin a message and validates the target", async () => {
    const forbidden = await pinMessage(
      createRequest("PATCH", "http://localhost/api/chat/pin", {
        userId: "user-1",
        messageId: "message-1",
      }),
    );
    expect(forbidden.status).toBe(403);

    jest.mocked(ChatModel.findOneAndUpdate).mockResolvedValue({ _id: "chat-1" } as never);
    const response = await pinMessage(
      createRequest(
        "PATCH",
        "http://localhost/api/chat/pin",
        { userId: "user-1", messageId: "message-1", pinStatus: false },
        { "x-user-role": "admin" },
      ),
    );
    expect(response.status).toBe(200);
    expect(ChatModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user-1", "messages._id": "message-1" },
      { $set: { "messages.$[msg].isPinned": false } },
      { arrayFilters: [{ "msg._id": "message-1" }], new: true },
    );

    const invalid = await pinMessage(
      createRequest(
        "PATCH",
        "http://localhost/api/chat/pin",
        { userId: "user-1" },
        { "x-user-role": "admin" },
      ),
    );
    expect(invalid.status).toBe(400);
  });

  it("returns an empty chat when no chat exists and requires a user identity", async () => {
    const lean = jest.fn().mockResolvedValue(null);
    const select = jest.fn().mockReturnValue({ lean });
    jest.mocked(ChatModel.findOneAndUpdate).mockReturnValue({ select } as never);

    const response = await getChat(
      createRequest("GET", "http://localhost/api/chat", undefined, {
        "x-user-id": "user-1",
        "x-user-role": "user",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      messages: [],
      userId: "user-1",
    });
    expect(ChatModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: "user-1" },
      { $set: { "messages.$[msg].isReaded": true } },
      {
        arrayFilters: [{ "msg.sender": "admin", "msg.isReaded": false }],
        new: true,
      },
    );
    expect(select).toHaveBeenCalledWith("messages unreadCount");

    const missingIdentity = await getChat(createRequest("GET", "http://localhost/api/chat"));
    expect(missingIdentity.status).toBe(400);
  });

  it("cleans up old messages only with the cron authorization secret", async () => {
    const unauthorized = await cleanupOldMessages(
      createRequest("GET", "http://localhost/api/cron/cleanup"),
    );
    expect(unauthorized.status).toBe(401);
    expect(ChatModel.updateMany).not.toHaveBeenCalled();

    jest.mocked(ChatModel.updateMany).mockResolvedValue({ modifiedCount: 2 } as never);
    const response = await cleanupOldMessages(
      createRequest("GET", "http://localhost/api/cron/cleanup", undefined, {
        authorization: "Bearer jest-test-cron-secret",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      affectedRows: 2,
    });
    expect(ChatModel.updateMany).toHaveBeenCalledWith(
      {},
      {
        $pull: {
          messages: {
            createdAt: { $lt: expect.any(Date) },
            isPinned: false,
          },
        },
      },
    );
  });
});

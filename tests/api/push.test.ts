import { NextRequest } from "next/server";
import { POST, DELETE } from "@/src/app/api/push/subscribe/route";
import { PushSubscriptionModel } from "@/src/models/push-subscription.model";

jest.mock("@/src/lib/db", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/src/models/push-subscription.model", () => ({
  PushSubscriptionModel: {
    findOneAndUpdate: jest.fn().mockResolvedValue({ _id: "subscription-1" }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  },
}));

function createRequest(method: "POST" | "DELETE", body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/push/subscribe", {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("Push subscription API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("requires authentication", async () => {
    const response = await POST(createRequest("POST", {
      endpoint: "https://push.example/subscription",
      keys: { p256dh: "public-key", auth: "auth-secret" },
    }));

    expect(response.status).toBe(401);
  });

  it("stores a valid push subscription for the authenticated user", async () => {
    const response = await POST(createRequest("POST", {
      endpoint: "https://push.example/subscription",
      keys: { p256dh: "public-key", auth: "auth-secret" },
    }, { "x-user-id": "user-1" }));

    expect(response.status).toBe(200);
    expect(PushSubscriptionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { endpoint: "https://push.example/subscription" },
      {
        userId: "user-1",
        endpoint: "https://push.example/subscription",
        keys: { p256dh: "public-key", auth: "auth-secret" },
      },
      { upsert: true, new: true },
    );
  });

  it("removes only the subscription owned by the authenticated user", async () => {
    const response = await DELETE(createRequest("DELETE", {
      endpoint: "https://push.example/subscription",
    }, { "x-user-id": "user-1" }));

    expect(response.status).toBe(200);
    expect(PushSubscriptionModel.deleteOne).toHaveBeenCalledWith({
      endpoint: "https://push.example/subscription",
      userId: "user-1",
    });
  });
});

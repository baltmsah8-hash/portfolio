self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener("push", function (event) {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch (err) {
        data = {
            title: "New notification",
            body: event.data.text(),
            url: "/",
        };
    }

    const checkClients = clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
            // إذا كان المستخدم نشط لا ترسل اشعارات
            const isFocused = windowClients.some((client) => client.focused);
            if (isFocused) {
                return;
            }

            return self.registration.showNotification(data.title, {
                body: data.body,
                icon: "/logo.png",
                badge: "/logo.png",
                tag: data.chatId || "chat-notification",
                renotify: true,
                data: {
                    url: data.url || "/",
                },
            });
        });

    event.waitUntil(checkClients);
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    const targetUrl = event.notification.data.url || "/";

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((windowClients) => {
                // إذا كان الموقع مفتوحاً في تبويب في الخلفية، ركّز عليه وافتح الرابط
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if ("focus" in client) {
                        client.navigate(targetUrl);
                        return client.focus();
                    }
                }
                // إذا كان المتصفح مغلقاً، افتح نافذة جديدة بالرابط
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});

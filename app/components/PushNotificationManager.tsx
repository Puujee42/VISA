"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from "@capacitor/push-notifications";

export default function PushNotificationManager() {
  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        const isPushAvailable = Capacitor.isPluginAvailable("PushNotifications");
        if (Capacitor.isNativePlatform() && isPushAvailable) {
          const result = await PushNotifications.requestPermissions();
          if (result.receive === "granted") {
            await PushNotifications.register();
          } else {
            console.log("Push notification permissions not granted.");
            return;
          }

          PushNotifications.addListener("registration", (token: Token) => {
            console.log("FCM Token:", token.value);
            // Example: send token to backend APIs
          });

          PushNotifications.addListener("registrationError", (error: any) => {
            console.error("Error on push registration:", error);
          });

          PushNotifications.addListener("pushNotificationReceived", (notification: PushNotificationSchema) => {
            console.log("Push received:", notification);
          });

          PushNotifications.addListener("pushNotificationActionPerformed", (notification: ActionPerformed) => {
            console.log("Push action performed:", notification);
          });
        }
      } catch (e) {
        console.error("Failed to initialize push notifications", e);
      }
    };

    initPushNotifications();

    return () => {
      if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("PushNotifications")) {
        PushNotifications.removeAllListeners();
      }
    };
  }, []);

  return null;
}

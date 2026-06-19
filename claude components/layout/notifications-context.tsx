import { createContext, useContext } from "react";
import { NotificationDataProps } from "./app-layout.type";

const NotificationsContext = createContext<NotificationDataProps[]>([]);

export const NotificationsProvider = NotificationsContext.Provider;

export const useNotifications = () => useContext(NotificationsContext);

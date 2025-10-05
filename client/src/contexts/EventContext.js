import { createContext, useContext } from "react";

const EventContext = createContext(null);

export const useEvents = () => useContext(EventContext);

export default EventContext;

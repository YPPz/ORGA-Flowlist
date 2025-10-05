import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import EventContext from "../contexts/EventContext";
import CategoryContext from "../contexts/CategoryContext"
import { getCategories } from "../api/category";
import Home from "./Home";
import Calendar from "./calendar/Calendar";
import Setting from "./Setting";
import Sidebar from "../components/Sidebar";
import Assistant from "../components/Assistant";


const pages = [
    { path: "/", element: <Home /> },
    { path: "/calendar", element: <Calendar /> },
    { path: "/setting", element: <Setting /> },
];

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export default function Layout() {
    const location = useLocation();
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);

     useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    return (
        <EventContext.Provider value={{ events, setEvents }}>
            <CategoryContext.Provider value={{ categories, setCategories }}>
            <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-body-tertiary p-4">
                <div className="position-relative bg-white d-flex w-100 h-100 rounded-2">
                    {/* Left contents */}
                    <div className="position-relative z-3">
                        <Sidebar />
                    </div>

                    {/* Middle contents */}
                    <div className="flex-grow-1 overflow-auto position-relative p-5 z-1 d-flex flex-column justify-content-start">
                        <AnimatePresence mode="wait">
                            <Routes location={location} key={location.pathname}>
                                {pages.map(({ path, element }) => (
                                    <Route
                                        key={path}
                                        path={path}
                                        element=
                                        {
                                            <motion.div
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                variants={pageVariants}
                                                transition={{ duration: 0.4 }}
                                                className="h-100" 
                                            >
                                                {element}
                                            </motion.div>
                                        }
                                    />
                                ))}
                            </Routes>
                        </AnimatePresence>
                    </div>

                    {/* Right contents */}
                    <div className="position-absolute bottom-0 end-0 pe-5 pb-3 z-3">
                        <Assistant />
                    </div>
                </div>
            </div>
            </CategoryContext.Provider>
        </EventContext.Provider>
    );
}


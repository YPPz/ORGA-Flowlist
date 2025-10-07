import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import EventContext from "../contexts/EventContext";
import CategoryContext from "../contexts/CategoryContext";
import { getCategories } from "../api/category";
import Home from "./Home";
import Calendar from "./calendar/Calendar";
import Setting from "./Setting";
import Topbar from "../components/Menu";
import Assistant from "../components/Assistant";
import { useState, useEffect } from "react";

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
                <div className="container-fluid vh-100 d-flex flex-column p-0 bg-body-tertiary">
                    {/* Topbar */}
                    <Topbar />

                    {/* Main Content */}
                    <div className="flex-grow-1 overflow-auto position-relative p-3 p-md-5" style={{ paddingTop: "10px" }}>
                        <AnimatePresence mode="wait">
                            <Routes location={location} key={location.pathname}>
                                {pages.map(({ path, element }) => (
                                    <Route
                                        key={path}
                                        path={path}
                                        element={
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


                    {/* Footer */}
                    {location.pathname === "/setting" && (
                        <footer className="border-top py-3 text-start small text-muted px-4">
                            &copy; 2025 ektasaeng w.
                        </footer>
                    )}

                    {/* Assistant */}
                    <div className="position-absolute bottom-0 end-0 pe-3 pb-3 z-3">
                        <Assistant />
                    </div>
                </div>

            </CategoryContext.Provider>
        </EventContext.Provider>
    );
}
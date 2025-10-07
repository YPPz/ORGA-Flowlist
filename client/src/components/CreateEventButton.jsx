import { useState, useEffect, useContext } from "react";
import { createEvent } from "../api/event";
import { getCategories, createCategory } from "../api/category";
import { formatForDB } from "../utils/datetime";
import { useEvents } from "../contexts/EventContext";
import { useCategories } from "../contexts/CategoryContext"
import { useUser } from "../contexts/UserContext";

export default function CreateEventButton({ className, label, ...props }) {
    const { user } = useUser();
    const { categories, setCategories } = useCategories();
    const { setEvents } = useEvents();
    const [isOther, setIsOther] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [animate, setAnimate] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        details: "",
        start_time: "",
        end_time: "",
        priority: null,
        category_id: "7",
        newCategoryName: "",
    });

    const openModal = () => {
        setShowModal(true);
        setTimeout(() => setAnimate(true), 10);
    };

    const closeModal = () => {
        setAnimate(false);
        setTimeout(() => {
            setShowModal(false);
            setIsOther(false);
        }, 250);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let categoryId = formData.category_id;

            if (categoryId === "other" && formData.newCategoryName.trim() !== "") {
                await createCategory({
                    name: formData.newCategoryName.trim(),
                    user_id: user.user_id,
                });

                const latestCategories = await getCategories();
                setCategories(latestCategories);

                const newCat = latestCategories.find(c => c.name === formData.newCategoryName.trim());
                categoryId = newCat?.category_id;
                setFormData(prev => ({ ...prev, category_id: categoryId }));
            }

            const eventToCreate = {
                ...formData,
                user_id: user.user_id,
                start_time: formatForDB(formData.start_time),
                end_time: formatForDB(formData.end_time),
                category_id: categoryId,
            };
            delete eventToCreate.newCategoryName;

            const newEvent = await createEvent(eventToCreate);

            setEvents(prev => [...prev, newEvent]);

            closeModal();
            setFormData({
                title: "",
                details: "",
                start_time: "",
                end_time: "",
                priority: null,
                category_id: "7",
                newCategoryName: "",
            });
        } catch (err) {
            console.error("Create failed:", err);
            alert("Failed to create event");
        }
    };

    return (
        <>
            <button
                className={`${className || "btn btn-primary rounded-3 px-4"}`}
                {...props}
                onClick={openModal}
            >
                {label ? label : "+ Create Event"}
            </button>

            {showModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        opacity: animate ? 1 : 0,
                        transition: "opacity 0.25s ease",
                        zIndex: 1050,
                    }}
                    onClick={closeModal}
                >
                    <div className="bg-white p-3 rounded"
                        style={{
                            width: "90%",
                            maxWidth: "700px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            transform: animate ? "scale(1)" : "scale(0.8)",
                            opacity: animate ? 1 : 0,
                            transition: "transform 0.25s ease, opacity 0.25s ease",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-center fw-bold" style={{ fontSize: "1.5rem" }}>Create Event</h3>
                        <form onSubmit={handleSubmit}>
                            <input type="text" placeholder="Title" className="form-control mb-3"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                style={{ fontSize: "1rem" }}
                            />
                            <textarea placeholder="Details" className="form-control mb-3" rows={4}
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                style={{ fontSize: "1rem" }}
                            />
                            <div className="row">
                                <div className="col-12 col-md-6">
                                    <label className="form-label small text-muted">Start</label>
                                    <input type="datetime-local" className="form-control mb-3"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label small text-muted">End</label>
                                    <input type="datetime-local" className="form-control mb-3"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <label className="form-label small text-muted">Priority</label>
                            <select className="form-select form-select-lg mb-3" value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                <option>None</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>

                            <label className="form-label small text-muted">Category</label>
                            <select className="form-select form-select-lg mb-3" value={formData.category_id}
                                onChange={(e) => {
                                    if (e.target.value === "other") {
                                        setIsOther(true);
                                        setFormData({ ...formData, category_id: "other" });
                                    } else {
                                        setIsOther(false);
                                        setFormData({ ...formData, category_id: e.target.value });
                                    }
                                }}
                                required
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map(cat => (
                                    <option key={cat.category_id} value={cat.category_id}>{cat.name} ({cat.type})</option>
                                ))}
                                <option value="other">Other...</option>
                            </select>

                            {isOther && (
                                <input type="text" placeholder="New category name" className="form-control form-control-lg mb-3"
                                    value={formData.newCategoryName}
                                    onChange={(e) => setFormData({ ...formData, newCategoryName: e.target.value })}
                                    required
                                />
                            )}

                            <div className="d-flex justify-content-end mt-4">
                                <button type="button" className="btn btn-secondary btn-lg me-2"
                                    onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-success btn-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}



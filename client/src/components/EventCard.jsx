import { deleteEvent, updateEvent } from "../api/event";
import { createCategory, getCategories } from "../api/category";
import { useCategories } from "../contexts/CategoryContext"
import { useState, useEffect, useContext } from "react";
import UserContext from "../contexts/UserContext";
import { formatForDisplay, formatForDB, formatForInput } from "../utils/datetime";

export default function EventCard({ event, onDelete, onUpdate }) {
    const { user } = useContext(UserContext);
    const { categories, setCategories } = useCategories();
    const [isEditing, setIsEditing] = useState(false);
    const [isOther, setIsOther] = useState(false);
    const [editedEvent, setEditedEvent] = useState({ ...event });
    const [showModal, setShowModal] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setEditedEvent({ ...event });
    }, [event]);

    const openModal = () => {
        setShowModal(true);
        setTimeout(() => setAnimate(true), 10);
    };

    const closeModal = () => {
        setAnimate(false);
        setTimeout(() => {
            setShowModal(false);
            setIsEditing(false);
            setIsOther(false);
        }, 250);
    };

    const handleUpdate = async () => {
        try {
            let categoryId = editedEvent.category_id;

            if (categoryId === "other") {
                if (!editedEvent.newCategoryName?.trim()) {
                    alert("Please enter a category name");
                    return;
                }
                await createCategory({
                    name: editedEvent.newCategoryName.trim(),
                    user_id: editedEvent.user_id,
                });

                // Fetch again from DB to ensure updated data
                const latestCategories = await getCategories();
                setCategories(latestCategories);

                // Update selected category to match the new name
                const newCat = latestCategories.find(c => c.name === editedEvent.newCategoryName.trim());
                categoryId = newCat?.category_id;
                setEditedEvent(prev => ({ ...prev, category_id: categoryId }));

            } else if (!categoryId) {
                categoryId = null;
            } else {
                categoryId = Number(categoryId);
            }

            const updatedData = {
                title: editedEvent.title,
                details: editedEvent.details || null,
                start_time: formatForDB(editedEvent.start_time),
                end_time: formatForDB(editedEvent.end_time),
                priority: editedEvent.priority || null,
                category_id: categoryId,
            };

            const updated = await updateEvent(editedEvent.event_id, updatedData);
            if (onUpdate) onUpdate(updated);
            closeModal();
        } catch (err) {
            console.error("Update event error:", err);
            alert("Failed to update event");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteEvent(event.event_id);
                if (onDelete) onDelete(event.event_id);
            } catch (err) {
                alert("Failed to delete event");
            }
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "low": return "#16a34a";
            case "medium": return "#facc15";
            case "high": return "#dc2626";
            default: return null;
        }
    };

    const getCategoryColors = (category_name) => {
        switch (category_name) {
            case "Work": return "#444b8e"
            case "Hobby": return "#008dc0ff"
            case "Vacation": return "#2a9d8f"
            case "Shopping": return "#a84a7f"
            case "Social event": return "#e76f51"
            case "Family": return "#e9c46a"
            case "None": return "#818181ff"
            default: return "#a3a380"
        }
    };

    return (
        <>
            {!showModal && (
                <div className="card shadow-sm border-0 rounded-4 position-relative py-2 px-2">
                    {/* Priority indicator */}
                    <div
                        className="position-absolute top-0 end-0 m-3 rounded-circle"
                        style={{ width: "18px", height: "18px", backgroundColor: getPriorityColor(event.priority), }}
                    ></div>

                    <div className="card-body">
                        <h5 className="card-title fw-bold">{event.title}</h5>

                        {event.category_id && event.category_name && (
                            <span
                                className="badge mb-2 text-white"
                                style={{ backgroundColor: getCategoryColors(event.category_name), borderRadius: "12px", padding: "5px 12px", fontSize: "0.85rem", }}
                            >
                                {event.category_name}
                            </span>
                        )}

                        <p className="card-text text-muted mb-1">{event.details}</p>
                        <p className="mb-1"><strong>Start:</strong> {formatForDisplay(event.start_time, "en-GB", "Asia/Bangkok")}</p>
                        <p className="mb-1"><strong>End:</strong> {formatForDisplay(event.end_time, "en-GB", "Asia/Bangkok")}</p>
                        {event.priority && (
                            <p className="mb-1"><strong>Priority:</strong> {event.priority}</p>
                        )}

                        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                            <button className="btn btn-outline-primary btn-sm" onClick={openModal}>Update</button>
                            <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-4 shadow-lg p-4 m-4"
                        style={{
                            width: "700px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            transform: animate ? "scale(1)" : "scale(0.8)",
                            opacity: animate ? 1 : 0,
                            transition: "transform 0.25s ease, opacity 0.25s ease",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-center fw-bold">Update Event</h3>

                        <label className="form-label small text-muted">
                            Title
                        </label>
                        <input type="text" className="form-control mb-2" value={editedEvent.title}
                            onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })} required />

                        <label className="form-label small text-muted">
                            Details
                        </label>
                        <textarea className="form-control mb-2" value={editedEvent.details}
                            onChange={(e) => setEditedEvent({ ...editedEvent, details: e.target.value })} />

                        <label className="form-label small text-muted">
                            Start
                        </label>
                        <input type="datetime-local" className="form-control mb-2"
                            value={formatForInput(editedEvent.start_time)}
                            onChange={(e) => setEditedEvent({ ...editedEvent, start_time: e.target.value })} required step={900} />

                        <label className="form-label small text-muted">
                            End
                        </label>
                        <input type="datetime-local" className="form-control mb-2"
                            value={formatForInput(editedEvent.end_time)}
                            onChange={(e) => setEditedEvent({ ...editedEvent, end_time: e.target.value })} required step={900} />

                        <label className="form-label small text-muted">
                            Priority
                        </label>
                        <select className="form-select mb-2" value={editedEvent.priority || null}
                            onChange={(e) => setEditedEvent({ ...editedEvent, priority: e.target.value })}>
                            <option>None</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>

                        <label className="form-label small text-muted">
                            Category
                        </label>
                        <select className="form-select mb-2" value={editedEvent.category_id || ""}
                            onChange={(e) => {
                                if (e.target.value === "other") {
                                    setIsOther(true);
                                    setEditedEvent({ ...editedEvent, category_id: "other" });
                                } else {
                                    setIsOther(false);
                                    setEditedEvent({ ...editedEvent, category_id: e.target.value });
                                }
                            }}
                            required
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat) => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.name} ({cat.type})
                                </option>
                            ))}
                            <option value="other">Other...</option>
                        </select>

                        {isOther && (
                            <input type="text" className="form-control mb-2" placeholder="New category name"
                                value={editedEvent.newCategoryName || ""}
                                onChange={(e) => setEditedEvent({ ...editedEvent, newCategoryName: e.target.value })} required />
                        )}

                        <div className="d-flex justify-content-end mt-3">
                            <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>Save</button>
                            <button className="btn btn-secondary btn-sm" onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

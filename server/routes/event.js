import express from 'express';
import { ensureAuth } from '../middlewares/auth.js';
import { ensureGoogleAccessToken } from '../middlewares/resetGoogleToken.js';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';

const router = express.Router();

router.use(ensureAuth);
router.use(ensureGoogleAccessToken);

router.route("/events")
    .get(listEvents)
    .post(createEvent)

router.route("/events/:id")
    .put(updateEvent)
    .delete(deleteEvent)

export default router;


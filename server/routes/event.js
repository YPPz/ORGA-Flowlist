import express from 'express';
import { ensureAuth } from '../middlewares/auth.js';
import { ensureGoogleAccessToken } from '../middlewares/resetGoogleToken.js';
import { listEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';

const router = express.Router();

router.use(ensureAuth);
router.use(ensureGoogleAccessToken);

router.get('/events', listEvents);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;


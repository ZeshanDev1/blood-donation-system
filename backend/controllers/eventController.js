const Event = require('../models/Event');
const { toImageUrl: buildImageUrl, removeImage } = require('../utils/imageStore');

const toImageUrl = (file) => buildImageUrl(file, 'events');
const removeFileIfExists = (fileUrl) => removeImage(fileUrl);

const buildEventPayload = (req) => {
  const { title, description, date, time, location } = req.body;
  const parsedDate = date ? new Date(date) : undefined;

  return {
    title,
    description,
    date: parsedDate,
    time,
    location
  };
};

exports.listPublicEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1, createdAt: -1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1, createdAt: -1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an event image' });
    }

    const payload = buildEventPayload(req);
    const missingField = Object.entries(payload).find(([, value]) => !value);

    if (missingField || Number.isNaN(payload.date?.getTime?.())) {
      await removeFileIfExists(toImageUrl(req.file));
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const event = new Event({
      ...payload,
      imageUrl: toImageUrl(req.file)
    });

    await event.save();

    res.status(201).json({ message: 'Event created', event });
  } catch (error) {
    if (req.file) {
      await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      if (req.file) {
        await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
      }
      return res.status(404).json({ error: 'Event not found' });
    }

    const payload = buildEventPayload(req);
    if (payload.date && Number.isNaN(payload.date.getTime())) {
      if (req.file) {
        await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
      }
      return res.status(400).json({ error: 'Please provide a valid event date' });
    }

    if (req.file) {
      await removeFileIfExists(event.imageUrl);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: payload.title,
          description: payload.description,
          date: payload.date,
          time: payload.time,
          location: payload.location,
          ...(req.file ? { imageUrl: toImageUrl(req.file) } : {})
        }
      },
      { new: true }
    );

    res.json({ message: 'Event updated', event: updatedEvent });
  } catch (error) {
    if (req.file) {
      await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await removeFileIfExists(event.imageUrl);

    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
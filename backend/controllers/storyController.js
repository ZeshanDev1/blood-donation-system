const Story = require('../models/Story');
const { toImageUrl: buildImageUrl, removeImage } = require('../utils/imageStore');

const toImageUrl = (file) => buildImageUrl(file, 'stories');
const removeFileIfExists = (fileUrl) => removeImage(fileUrl);

const buildStoryPayload = (req) => {
  const { title, description } = req.body;

  return { title, description };
};

exports.listPublicStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json({ stories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json({ stories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a story image' });
    }

    const payload = buildStoryPayload(req);
    const missingField = Object.entries(payload).find(([, value]) => !value);

    if (missingField) {
      await removeFileIfExists(toImageUrl(req.file));
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const story = new Story({
      ...payload,
      imageUrl: toImageUrl(req.file),
    });

    await story.save();

    res.status(201).json({ message: 'Story created', story });
  } catch (error) {
    if (req.file) {
      await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      if (req.file) {
        await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
      }
      return res.status(404).json({ error: 'Story not found' });
    }

    const payload = buildStoryPayload(req);

    if (req.file) {
      await removeFileIfExists(story.imageUrl);
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: payload.title || story.title,
          description: payload.description || story.description,
          ...(req.file ? { imageUrl: toImageUrl(req.file) } : {}),
        },
      },
      { new: true }
    );

    res.json({ message: 'Story updated', story: updatedStory });
  } catch (error) {
    if (req.file) {
      await removeFileIfExists(toImageUrl(req.file)).catch(() => {});
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    await removeFileIfExists(story.imageUrl);

    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

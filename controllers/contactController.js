const db = require('../config/db');

exports.getContact = async (req, res) => {
  try {
    const [contact] = await db.query('SELECT email, instagram, youtube, linkedin, description FROM contact WHERE id = 1');
    if (contact.length === 0) {
      return res.status(404).json({ message: 'Contact info not found' });
    }
    res.json(contact[0]);
  } catch (error)
 {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateContact = async (req, res) => {
    const { email, instagram, youtube, linkedin, description } = req.body;
    try {
        await db.query(
            'UPDATE contact SET email = ?, instagram = ?, youtube = ?, linkedin = ?, description = ? WHERE id = 1',
            [email, instagram, youtube, linkedin, description]
        );
        res.json({ message: 'Contact info updated successfully' });
    } catch (error) {
        console.error('Error updating contact info:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

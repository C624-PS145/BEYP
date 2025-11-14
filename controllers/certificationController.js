const db = require('../config/db');

exports.getAllCertifications = async (req, res) => {
  try {
    const [certifications] = await db.query('SELECT id, category, name, issuer, year, link FROM certifications ORDER BY id DESC, name ASC');
    res.json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createCertification = async (req, res) => {
    const { category, name, issuer, year, link } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO certifications (category, name, issuer, year, link) VALUES (?, ?, ?, ?, ?)',
            [category, name, issuer, year, link]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error creating certification:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateCertification = async (req, res) => {
    const { id } = req.params;
    const { category, name, issuer, year, link } = req.body;
    try {
        await db.query(
            'UPDATE certifications SET category = ?, name = ?, issuer = ?, year = ?, link = ? WHERE id = ?',
            [category, name, issuer, year, link, id]
        );
        res.json({ message: 'Certification updated successfully' });
    } catch (error) {
        console.error('Error updating certification:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteCertification = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM certifications WHERE id = ?', [id]);
        res.json({ message: 'Certification deleted successfully' });
    } catch (error) {
        console.error('Error deleting certification:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const db = require('../config/db');

// @desc    Get all technologies
// @route   GET /api/technologies
// @access  Public
exports.getAllTechnologies = async (req, res) => {
  try {
    const [technologies] = await db.query('SELECT id, name, icon FROM technologies ORDER BY name ASC');
    res.json(technologies);
  } catch (error) {
    console.error('Error fetching technologies:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new technology
// @route   POST /api/technologies
// @access  Private
exports.createTechnology = async (req, res) => {
    const { name, icon } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO technologies (name, icon) VALUES (?, ?)',
            [name, icon || null]
        );
        res.status(201).json({ id: result.insertId, name, icon });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Technology with this name already exists.' });
        }
        console.error('Error creating technology:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a technology
// @route   PUT /api/technologies/:id
// @access  Private
exports.updateTechnology = async (req, res) => {
    const { id } = req.params;
    const { name, icon } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    try {
        const [result] = await db.query(
            'UPDATE technologies SET name = ?, icon = ? WHERE id = ?',
            [name, icon || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Technology not found' });
        }
        res.json({ message: 'Technology updated successfully' });
    } catch (error)
 {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Another technology with this name already exists.' });
        }
        console.error('Error updating technology:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a technology
// @route   DELETE /api/technologies/:id
// @access  Private
exports.deleteTechnology = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // First, remove associations with projects
        await connection.query('DELETE FROM project_technologies WHERE technology_id = ?', [id]);
        // Then, delete the technology itself
        const [result] = await connection.query('DELETE FROM technologies WHERE id = ?', [id]);
        
        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Technology not found' });
        }
        res.json({ message: 'Technology deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting technology:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};
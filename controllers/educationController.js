const db = require('../config/db');

exports.getAllEducation = async (req, res) => {
  try {
    const [educationRows] = await db.query(`
      SELECT 
        id, institution, degree, major, logo, gpa, predicate, scholarship, 
        start_date AS startDate, end_date AS endDate, transcript_link AS transcriptLink 
      FROM education ORDER BY end_date DESC
    `);

    if (educationRows.length === 0) {
      return res.json([]);
    }

    const educationData = await Promise.all(educationRows.map(async (edu) => {
      const [publications] = await db.query('SELECT title, authors, publisher, index_level AS `index`, year, link FROM publications WHERE education_id = ? ORDER BY year DESC', [edu.id]);
      const [achievements] = await db.query('SELECT description, link FROM achievements WHERE education_id = ? ORDER BY id DESC', [edu.id]);
      
      return {
        ...edu,
        publications,
        achievements
      };
    }));

    res.json(educationData);
  } catch (error) {
    console.error('Error fetching education:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const manageEducationDependencies = async (connection, educationId, publications, achievements) => {
    await connection.query('DELETE FROM publications WHERE education_id = ?', [educationId]);
    await connection.query('DELETE FROM achievements WHERE education_id = ?', [educationId]);

    if (publications && publications.length > 0) {
        const pubInserts = publications.map(p => {
            return connection.query('INSERT INTO publications (education_id, title, authors, publisher, index_level, year, link) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [educationId, p.title, p.authors, p.publisher, p.index, p.year, p.link]);
        });
        await Promise.all(pubInserts);
    }

    if (achievements && achievements.length > 0) {
        const achInserts = achievements.map(a => {
            return connection.query('INSERT INTO achievements (education_id, description, link) VALUES (?, ?, ?)', 
            [educationId, a.description, a.link]);
        });
        await Promise.all(achInserts);
    }
};

exports.createEducation = async (req, res) => {
    const { institution, degree, major, logo, gpa, predicate, scholarship, startDate, endDate, transcriptLink, publications, achievements } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            'INSERT INTO education (institution, degree, major, logo, gpa, predicate, scholarship, start_date, end_date, transcript_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [institution, degree, major, logo, gpa, predicate, scholarship, startDate, endDate, transcriptLink]
        );
        const educationId = result.insertId;
        await manageEducationDependencies(connection, educationId, publications, achievements);
        await connection.commit();
        res.status(201).json({ message: 'Education created successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating education:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};

exports.updateEducation = async (req, res) => {
    const { id } = req.params;
    const { institution, degree, major, logo, gpa, predicate, scholarship, startDate, endDate, transcriptLink, publications, achievements } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(
            'UPDATE education SET institution = ?, degree = ?, major = ?, logo = ?, gpa = ?, predicate = ?, scholarship = ?, start_date = ?, end_date = ?, transcript_link = ? WHERE id = ?',
            [institution, degree, major, logo, gpa, predicate, scholarship, startDate, endDate, transcriptLink, id]
        );
        await manageEducationDependencies(connection, id, publications, achievements);
        await connection.commit();
        res.json({ message: 'Education updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating education:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};

exports.deleteEducation = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM publications WHERE education_id = ?', [id]);
        await connection.query('DELETE FROM achievements WHERE education_id = ?', [id]);
        await connection.query('DELETE FROM education WHERE id = ?', [id]);
        await connection.commit();
        res.json({ message: 'Education deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting education:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};

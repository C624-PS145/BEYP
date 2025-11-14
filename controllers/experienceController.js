const db = require('../config/db');

exports.getAllExperience = async (req, res) => {
  try {
    const [experience] = await db.query(`
      SELECT
        id,
        company,
        position,
        logo,
        description,
        start_date AS startDate,
        end_date AS endDate,
        related_certification_id AS certificationId,
        CASE
          WHEN LOWER(TRIM(end_date)) IN ('present', 'sekarang') THEN '9999-12-31'
          ELSE
            STR_TO_DATE(
              CONCAT(
                '01 ',
                SUBSTRING_INDEX(end_date, ' ', 1),
                ' ',
                SUBSTRING_INDEX(end_date, ' ', -1)
              ),
              '%d %M %Y'
            )
        END AS convertedDate
      FROM experience
      ORDER BY convertedDate DESC;
    `);

    res.json(experience);
  } catch (error) {
    console.error("Error fetching experience:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createExperience = async (req, res) => {
  const { company, position, logo, description, startDate, endDate, certificationId } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO experience (company, position, logo, description, start_date, end_date, related_certification_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [company, position, logo, description, startDate, endDate, certificationId || null]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Error creating experience:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateExperience = async (req, res) => {
  const { id } = req.params;
  const { company, position, logo, description, startDate, endDate, certificationId } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE experience SET company = ?, position = ?, logo = ?, description = ?, start_date = ?, end_date = ?, related_certification_id = ? WHERE id = ?',
      [company, position, logo, description, startDate, endDate, certificationId || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json({ id, ...req.body });
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteExperience = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM experience WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Experience not found' });
    }

    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

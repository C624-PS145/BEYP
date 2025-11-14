const db = require('../config/db');

exports.getAllProjects = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.github_link AS githubLink,
        p.demo_link AS demoLink,
        p.is_featured AS isFeatured,
        (SELECT GROUP_CONCAT(pi.image_url) FROM project_images pi WHERE pi.project_id = p.id) AS images,
        (SELECT GROUP_CONCAT(CONCAT_WS('||', t.name, t.icon) SEPARATOR ',,') 
         FROM technologies t 
         JOIN project_technologies pt ON t.id = pt.technology_id 
         WHERE pt.project_id = p.id) AS technologies
      FROM projects p
      ORDER BY p.id DESC;
    `;
    const [projects] = await db.query(query);

    const formattedProjects = projects.map(p => ({
      ...p,
      images: p.images ? p.images.split(',') : [],
      technologies: p.technologies ? p.technologies.split(',,').map(techString => {
          const parts = techString.split('||');
          return { name: parts[0], icon: parts[1] === 'null' ? null : parts[1] };
      }) : [],
      isFeatured: Boolean(p.isFeatured)
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const manageProjectDependencies = async (connection, projectId, technologies, images) => {
    // Clear old dependencies
    await connection.query('DELETE FROM project_technologies WHERE project_id = ?', [projectId]);
    await connection.query('DELETE FROM project_images WHERE project_id = ?', [projectId]);

    // Handle technologies
    if (technologies && technologies.length > 0) {
        for (const techName of technologies) {
            let [techRows] = await connection.query('SELECT id FROM technologies WHERE name = ?', [techName]);
            let technologyId;

            if (techRows.length === 0) {
                // If technology doesn't exist, create it (icon will be null by default)
                const [result] = await connection.query('INSERT INTO technologies (name) VALUES (?)', [techName]);
                technologyId = result.insertId;
            } else {
                technologyId = techRows[0].id;
            }
            
            // Link the technology to the project.
            await connection.query(
                'INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)',
                [projectId, technologyId]
            );
        }
    }
    
    // Handle images
    if (images && images.length > 0) {
        const imageInserts = images.map(imageUrl => {
            return connection.query('INSERT INTO project_images (project_id, image_url) VALUES (?, ?)', [projectId, imageUrl]);
        });
        await Promise.all(imageInserts);
    }
};

exports.createProject = async (req, res) => {
    const { title, description, githubLink, demoLink, isFeatured, technologies, images } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            'INSERT INTO projects (title, description, github_link, demo_link, is_featured) VALUES (?, ?, ?, ?, ?)',
            [title, description, githubLink, demoLink, isFeatured]
        );
        const projectId = result.insertId;
        await manageProjectDependencies(connection, projectId, technologies, images);
        await connection.commit();
        res.status(201).json({ message: 'Project created successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};

exports.updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, githubLink, demoLink, isFeatured, technologies, images } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(
            'UPDATE projects SET title = ?, description = ?, github_link = ?, demo_link = ?, is_featured = ? WHERE id = ?',
            [title, description, githubLink, demoLink, isFeatured, id]
        );
        await manageProjectDependencies(connection, id, technologies, images);
        await connection.commit();
        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};

exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM project_technologies WHERE project_id = ?', [id]);
        await connection.query('DELETE FROM project_images WHERE project_id = ?', [id]);
        await connection.query('DELETE FROM projects WHERE id = ?', [id]);
        await connection.commit();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        connection.release();
    }
};
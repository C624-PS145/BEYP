const db = require('../config/db');

// Helper function to run a query and format the result
const queryAndFormat = async (queryString, formattingFn) => {
    const [results] = await db.query(queryString);
    return formattingFn(results);
};

const getFullPortfolioContext = async () => {
    const profilePromise = queryAndFormat(
        'SELECT name, profile_image AS profileImage, description FROM profile WHERE id = 1',
        results => results[0]
    );
    
    const experiencePromise = queryAndFormat(
        `SELECT
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
            ORDER BY convertedDate DESC`,
        results => results
        );


    const projectsPromise = queryAndFormat(
        `SELECT p.id, p.title, p.description, p.github_link AS githubLink, p.demo_link AS demoLink, p.is_featured AS isFeatured,
        (SELECT GROUP_CONCAT(pi.image_url) FROM project_images pi WHERE pi.project_id = p.id) AS images,
        (SELECT GROUP_CONCAT(t.name) FROM technologies t JOIN project_technologies pt ON t.id = pt.technology_id WHERE pt.project_id = p.id) AS technologies
        FROM projects p ORDER BY p.id DESC`,
        results => results.map(p => ({
            ...p,
            images: p.images ? p.images.split(',') : [],
            technologies: p.technologies ? p.technologies.split(',') : [],
            isFeatured: Boolean(p.isFeatured)
        }))
    );

    const certificationsPromise = queryAndFormat(
        'SELECT id, category, name, issuer, year, link FROM certifications ORDER BY year DESC',
        results => results
    );

    const educationPromise = (async () => {
        const [eduRows] = await db.query('SELECT id, institution, degree, major, logo, gpa, predicate, scholarship, start_date AS startDate, end_date AS endDate, transcript_link AS transcriptLink FROM education ORDER BY end_date DESC');
        return Promise.all(eduRows.map(async (edu) => {
            const [publications] = await db.query('SELECT title, authors, publisher, index_level AS `index`, year, link FROM publications WHERE education_id = ? ORDER BY year DESC', [edu.id]);
            const [achievements] = await db.query('SELECT description, link FROM achievements WHERE education_id = ? ORDER BY id DESC', [edu.id]);
            return { ...edu, publications, achievements };
        }));
    })();

    const contactPromise = queryAndFormat(
        'SELECT email, instagram, youtube, linkedin, description FROM contact WHERE id = 1',
        results => results[0]
    );
    
    const aboutPromise = (async () => {
        const [about] = await db.query('SELECT description FROM about WHERE id = 1');
        const [imagesResult] = await db.query('SELECT image_url FROM about_images WHERE about_id = 1');
        return {
            description: about[0]?.description || '',
            images: imagesResult.map(img => img.image_url)
        };
    })();

    const [profile, experience, projects, certifications, education, contact, about] = await Promise.all([
        profilePromise,
        experiencePromise,
        projectsPromise,
        certificationsPromise,
        educationPromise,
        contactPromise,
        aboutPromise
    ]);

    return { profile, experience, projects, certifications, education, contact, about };
};

exports.getPortfolioContext = async (req, res) => {
    try {
        const context = await getFullPortfolioContext();
        res.json(context);
    } catch (error) {
        console.error('Error fetching portfolio context:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getFullPortfolioContext = getFullPortfolioContext;

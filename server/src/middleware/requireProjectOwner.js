import sql from '../db.js';

/**
 * Middleware — vérifie que le projet :projectId appartient au userId ou deviceId du contexte.
 * Doit être appliqué APRÈS requireIdentity.
 * Retourne 404 si le projet n'existe pas ou n'appartient pas à l'utilisateur
 * (réponse uniforme pour éviter l'énumération de projets).
 */
export async function requireProjectOwner(c, next) {
  const projectId = c.req.param('projectId');
  if (!projectId) return await next();

  const userId   = c.get('userId');
  const deviceId = c.get('deviceId');

  const rows = await sql`
    SELECT user_id, device_id FROM projects WHERE id = ${projectId}
  `;

  if (rows.length === 0) {
    return c.json({ error: 'Projet introuvable' }, 404);
  }

  const project = rows[0];

  // Utilisateur authentifié → le projet doit lui appartenir
  if (userId && project.user_id === userId) {
    return await next();
  }

  // Utilisateur anonyme → le projet doit correspondre à son deviceId et ne pas avoir de user_id
  if (!userId && deviceId && project.device_id === deviceId && !project.user_id) {
    return await next();
  }

  return c.json({ error: 'Projet introuvable' }, 404);
}

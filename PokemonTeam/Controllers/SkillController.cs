using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokemonTeam.Data;
using PokemonTeam.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PokemonTeam.Controllers
{
    /// <summary>
    /// Contrôleur pour gérer les opérations CRUD sur les compétences (Skill) dans l'application PokemonTeam.
    /// </summary>
    /// <remarks>
    /// Routes disponibles :
    /// <list type="bullet">
    ///   <item>
    ///     <description>GET /api/skills : Récupère la liste de toutes les compétences.</description>
    ///   </item>
    ///   <item>
    ///     <description>GET /api/skills/{id} : Récupère une compétence par son identifiant.</description>
    ///   </item>
    ///   <item>
    ///     <description>POST /api/skills : Crée une nouvelle compétence.</description>
    ///   </item>
    ///   <item>
    ///     <description>PUT /api/skills/{id} : Met à jour une compétence existante.</description>
    ///   </item>
    ///   <item>
    ///     <description>DELETE /api/skills/{id} : Supprime une compétence par son identifiant.</description>
    ///   </item>
    /// </list>
    /// </remarks>
    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        /// <summary>
        /// Constructeur du SkillsController.
        /// </summary>
        /// <param name="context">Contexte de la base de données pour accéder aux compétences.</param>
        public SkillsController(PokemonDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Récupère la liste complète des compétences.
        /// </summary>
        /// <returns>Une liste de compétences.</returns>
        /// <response code="200">Retourne la liste des compétences.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Skill>>> GetSkills()
        {
            return await _context.Skills.ToListAsync();
        }

        /// <summary>
        /// Récupère une compétence spécifique par son identifiant.
        /// </summary>
        /// <param name="id">L'identifiant de la compétence.</param>
        /// <returns>La compétence correspondante si elle existe.</returns>
        /// <response code="200">Retourne la compétence.</response>
        /// <response code="404">Si la compétence n'est pas trouvée.</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<Skill>> GetSkill(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null)
            {
                return NotFound();
            }
            return skill;
        }

        /// <summary>
        /// Crée une nouvelle compétence.
        /// </summary>
        /// <param name="skill">L'objet compétence à créer.</param>
        /// <returns>La compétence créée avec son identifiant.</returns>
        /// <response code="201">Retourne la compétence créée.</response>
        /// <response code="400">Si la requête est invalide.</response>
        [HttpPost]
        public async Task<ActionResult<Skill>> CreateSkill([FromBody] Skill skill)
        {
            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSkill), new { id = skill.Id }, skill);
        }

        /// <summary>
        /// Met à jour une compétence existante.
        /// </summary>
        /// <param name="id">L'identifiant de la compétence à mettre à jour.</param>
        /// <param name="skill">Les nouvelles données de la compétence.</param>
        /// <returns>Aucun contenu si la mise à jour est effectuée avec succès.</returns>
        /// <response code="204">Mise à jour réussie.</response>
        /// <response code="400">Si l'ID de la requête ne correspond pas à celui de la compétence.</response>
        /// <response code="404">Si la compétence n'est pas trouvée.</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSkill(int id, [FromBody] Skill skill)
        {
            if (id != skill.Id)
            {
                return BadRequest("L'ID de la compétence ne correspond pas.");
            }

            _context.Entry(skill).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Skills.Any(s => s.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }

        /// <summary>
        /// Supprime une compétence existante par son identifiant.
        /// </summary>
        /// <param name="id">L'identifiant de la compétence à supprimer.</param>
        /// <returns>Aucun contenu si la suppression est effectuée avec succès.</returns>
        /// <response code="204">Suppression réussie.</response>
        /// <response code="404">Si la compétence n'est pas trouvée.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            var skill = await _context.Skills.FindAsync(id);
            if (skill == null)
            {
                return NotFound();
            }

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using PokemonTeam.Data;
using PokemonTeam.Exceptions;
using PokemonTeam.Models;
using PokemonTeam.Services;
using System.Collections.Generic;
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
    ///   <item>
    ///     <description>POST /api/skills/use : Utilise une compétence dans un combat.</description>
    ///   </item>
    /// </list>
    /// </remarks>
    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly PokemonDbContext _context;
        private readonly ITypeChartService _typeChartService;

        /// <summary>
        /// Constructeur du SkillsController.
        /// </summary>
        /// <param name="context">Contexte de la base de données.</param>
        /// <param name="typeChartService">Service pour les multiplicateurs de type.</param>
        public SkillsController(PokemonDbContext context, ITypeChartService typeChartService)
        {
            _context = context;
            _typeChartService = typeChartService;
        }

        /// <summary>
        /// Récupère la liste complète des compétences.
        /// </summary>
        /// <returns>Une liste de compétences.</returns>
        /// <response code="200">Retourne la liste des compétences.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Skill>>> GetSkills()
        {
            return Ok(await Skill.GetAllAsync(_context));
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
            var skill = await Skill.GetByIdAsync(id, _context);
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
            var createdSkill = await Skill.CreateAsync(skill, _context);
            return CreatedAtAction(nameof(GetSkill), new { id = createdSkill.Id }, createdSkill);
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

            var success = await Skill.UpdateAsync(id, skill, _context);

            if (!success)
            {
                return NotFound();
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
            var success = await Skill.DeleteAsync(id, _context);
            if (!success)
            {
                return NotFound();
            }

            return NoContent();
        }

        /// <summary>
        /// Utilise une compétence dans un combat entre deux Pokémon.
        /// </summary>
        /// <param name="request">Requête contenant l'attaquant, la cible et la compétence à utiliser.</param>
        /// <returns>Réponse indiquant les dégâts infligés et l'état de la cible.</returns>
        /// <response code="200">Utilisation réussie de la compétence.</response>
        /// <response code="400">Si la compétence n'a plus de PP ou autre erreur.</response>
        [HttpPost("use")]
        public async Task<ActionResult<UseSkillResponse>> UseSkill([FromBody] UseSkillRequest request)
        {
            try
            {
                // Le modèle Skill contient maintenant cette logique métier
                var response = await request.Skill.UseInBattle(request.Attacker, request.Target, _typeChartService);
                return Ok(response);
            }
            catch (NotEnoughPowerPointsException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}

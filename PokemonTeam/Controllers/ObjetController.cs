using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PokemonTeam.Controllers
{
    
    [Route("api/[controller]")]
    [ApiController]
    public class ObjetController : ControllerBase
    {
        private readonly ArenaContext _context;

        public ObjetController(ArenaContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Objet>>> GetObjets()
        {
            return await _context.Objets.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Objet>> GetObjet(int id)
        {
            var objet = await _context.Objets.FindAsync(id);

            if (objet == null)
                return NotFound();

            return objet;
        }

        [HttpPost]
        public async Task<ActionResult<Objet>> CreateObjet(Objet objet)
        {
            _context.Objets.Add(objet);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetObjet), new { id = objet.Id }, objet);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateObjet(int id, Objet objet)
        {
            if (id != objet.Id)
                return BadRequest();

            _context.Entry(objet).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Objets.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteObjet(int id)
        {
            var objet = await _context.Objets.FindAsync(id);
            if (objet == null)
                return NotFound();

            _context.Objets.Remove(objet);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

}

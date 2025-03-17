namespace PokemonTeam.Models
{
    // La classe Skill représente une compétence avec les attributs suivants :
    // - Name : le nom de la compétence (string)
    // - Type : le type de la compétence (string)
    // - Damage : les dégâts infligés (int)
    // - PowerPoint : le nombre de points de pouvoir (int)
    // - Accuracy : la précision de la compétence (int)
    public class Skill
    {
        private string name { get; set; }
        private string type { get; set; }
        private int damage { get; set; }
        private int powerPoints { get; set; }
        private int accuracy { get; set; }

        public Skill(string name, string type, int damage, int powerPoints, int accuracy)
        {
            this.name = name;
            this.type = type;
            this.damage = damage;
            this.powerPoints = powerPoints;
            this.accuracy = accuracy;
        }
    }
}

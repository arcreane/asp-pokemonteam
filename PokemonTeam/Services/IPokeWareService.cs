/// <summary>
/// Defines methods for quiz generation and validation.
/// </summary>
/// <author>
/// Elerig
/// </author>
public interface IQuizService
{
    List<QuizQuestion> GenerateQuiz(int count);
    bool ValidateAnswer(QuizQuestion question, string userAnswer);
}

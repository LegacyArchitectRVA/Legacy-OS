export async function executiveAdvisor(input:{question:string,context:string[]}){
  return {
    role:'Executive Advisor',
    question:input.question,
    context:input.context,
    recommendation:'Ready for model-powered analysis.'
  };
}

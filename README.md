#Guia de Instalação: Vite (React) + Tailwind CSS + GSAP

Este guia instrui como criar um projeto React moderno do zero utilizando Vite (com JavaScript puro), configurando o Tailwind CSS para estilização e o GSAP (junto com a integração oficial @gsap/react) para animações.

🚀 Passo 1: Criar o Projeto com Vite e React

Abra o terminal na pasta onde deseja salvar o projeto e execute:

npm create vite@latest meu-projeto


Quando solicitado o nome do projeto (Project name:), digite o nome desejado ou pressione Enter.

Na opção de Framework, selecione React.

Na opção de Variant, escolha JavaScript (não selecione TypeScript nem React Compiler).

Em seguida, acesse a pasta e instale as dependências padrão:

cd meu-projeto
npm install


🎨 Passo 2: Instalar e Configurar o Tailwind CSS

Instale o Tailwind CSS e suas dependências no ambiente de desenvolvimento:

npm install tailwindcss @tailwindcss/vite

⚡ Passo 3: Instalar o GSAP

Instale a biblioteca de animação GSAP junto com o hook oficial para React (@gsap/react):

npm install gsap @gsap/react

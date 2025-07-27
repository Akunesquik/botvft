require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const commands = [
    new SlashCommandBuilder()
        .setName('podium')
        .setDescription('Met à jour le classement avec un podium')
        .addStringOption(option => option.setName('premier').setDescription('Nom de l’équipe en 1ère place').setRequired(true))
        .addStringOption(option => option.setName('deuxieme').setDescription('Nom de l’équipe en 2e place').setRequired(true))
        .addStringOption(option => option.setName('troisieme').setDescription('Nom de l’équipe en 3e place').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // 🔒 Restriction admin
    new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Réinitialise le classement')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔒 Restriction admin
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Déploiement des commandes...');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('✅ Commandes déployées avec succès.');
    } catch (error) {
        console.error(error);
    }
})();

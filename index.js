require('dotenv').config();
const { Client, GatewayIntentBits,EmbedBuilder,MessageFlags   } = require('discord.js');
const fs = require('fs');

const TOKEN = process.env.TOKEN;
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;
const DATA_FILE = './data.json';

let data = {};
if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE));
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function updateLeaderboard(channel) {
    const entries = Object.entries(data)
        .sort((a, b) => b[1] - a[1]); // tri décroissant

    const maxLength = Math.max(...entries.map(([team]) => team.length));

    let classement = '```'; // Bloc monospace pour aligner

    entries.forEach(([team, points], index) => {
        if (index < 12) {
            const padding = ' '.repeat(maxLength - team.length);
            classement += `${index + 1}. ${team}${padding} [${points} pts]\n`;
        } else {
            const padding = ' '.repeat(maxLength - team.length);
            classement += `${team}${padding} [${points} pts]\n`;
        }
    });

    classement += '```';


    if (classement === '') classement = 'Aucun classement pour le moment.';

    // Création de l'embed
    const embed = new EmbedBuilder()
        .setColor(0xFFD700) // Couleur dorée
        .setTitle('🏆 Classement du Tournoi')
        .setDescription(classement)
        .setThumbnail('https://example.com/logo.png') // ✅ Mets ici ton URL du logo
        .setFooter({ text: 'Dernière mise à jour' })
        .setTimestamp();

    // Édite le dernier message du bot ou envoie un nouveau
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessage = messages.find(msg => msg.author.id === client.user.id);

    if (botMessage) {
        botMessage.edit({ embeds: [embed] });
    } else {
        channel.send({ embeds: [embed] });
    }
}



client.once('ready', () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (interaction.commandName === 'podium') {

        const first = interaction.options.getString('premier');
        const second = interaction.options.getString('deuxieme');
        const third = interaction.options.getString('troisieme');

        data[first] = (data[first] || 0) + 5;
        data[second] = (data[second] || 0) + 3;
        data[third] = (data[third] || 0) + 1;

        saveData();
        await updateLeaderboard(channel);
        await interaction.reply({
            content: `✅ Podium ajouté : ${first} (+5), ${second} (+3), ${third} (+1).`,
            flags: MessageFlags.Ephemeral
        });
    }

    if (interaction.commandName === 'reset') {
        data = {};
        saveData();
        await updateLeaderboard(channel);
        await interaction.reply({
            content: '✅ Classement réinitialisé.',
            flags: MessageFlags.Ephemeral
        });
    }
});

client.login(TOKEN);

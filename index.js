import { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } from "discord.js";

const { DISCORD_TOKEN, WEB_URL, API_SECRET } = process.env;
if (!DISCORD_TOKEN || !WEB_URL || !API_SECRET) {
  console.error("Faltan variables en .env (DISCORD_TOKEN, WEB_URL, API_SECRET).");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", async () => {
  await client.application.commands.create({
    name: "verificados",
    description: "Muestra los jugadores verificados en la página",
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild.toString(),
  });
  console.log(`Bot listo como ${client.user.tag}`);
});

client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand() || i.commandName !== "verificados") return;
  await i.deferReply({ ephemeral: true });
  try {
    const r = await fetch(`${WEB_URL.replace(/\/+$/, "")}/api/verificados`, {
      headers: { "x-api-key": API_SECRET },
    });
    if (!r.ok) throw new Error(`La web respondió ${r.status}`);
    const { total, verificados } = await r.json();

    const lineas = verificados
      .slice(0, 25)
      .map((v) => `• **${v.nombre}** (<t:${Math.floor(new Date(v.fecha).getTime() / 1000)}:R>)`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`✅ Verificados: ${total}`)
      .setDescription(lineas || "Todavía nadie se ha verificado.")
      .setColor(0x8b5cf6);
    await i.editReply({ embeds: [embed] });
  } catch (e) {
    await i.editReply(`No pude consultar la web: ${e.message}`);
  }
});

client.login(DISCORD_TOKEN);

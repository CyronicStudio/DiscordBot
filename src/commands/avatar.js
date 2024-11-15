const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Replies with your Avatar")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to view their avatar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const userOption = interaction.options.getUser("user") || interaction.user;

    const Embed = new EmbedBuilder()
      .setColor("Aqua")
      .setTitle(`${userOption.displayName}'s Avatar`)
      .setImage(
        userOption.displayAvatarURL({
          size: 1024,
          dynamic: true,
        })
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    await interaction.reply({
      embeds: [Embed],
    });
  },
};

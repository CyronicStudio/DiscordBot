const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a member from the server")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Select the member to ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for banning the member")
        .setRequired(false)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("member");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    // Check if the bot has permission to ban members
    if (!interaction.guild.members.me.permissions.has("BanMembers")) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Permission Error")
        .setDescription("I don't have permission to ban members.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [noPermissionEmbed],
        ephemeral: true,
      });
    }

    // Check if the bot can ban the member (role hierarchy check)
    if (
      member.roles.highest.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      const hierarchyErrorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Ban Error")
        .setDescription("I can't ban this member due to role hierarchy.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [hierarchyErrorEmbed],
        ephemeral: true,
      });
    }

    // Check if the user is trying to ban themselves or the bot
    if (member.id === interaction.user.id) {
      const selfBanEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Ban Error")
        .setDescription("You cannot ban yourself!")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [selfBanEmbed], ephemeral: true });
    }

    if (member.id === interaction.client.user.id) {
      const botBanEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Ban Error")
        .setDescription("I cannot ban myself.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [botBanEmbed], ephemeral: true });
    }

    try {
      // Ban the member
      await member.ban({ reason });

      // Success embed
      const successEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Member Banned")
        .setDescription(`<@${member.user.id}>  has been banned.`)
        .addFields({ name: "Reason", value: reason })
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);

      // Error embed
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Ban Error")
        .setDescription(
          "There was an error banning the member. Please try again."
        )
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a member from the server")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select the member to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for kicking the member")
        .setRequired(false)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    // Check if the bot has permission to kick members
    if (!interaction.guild.members.me.permissions.has("KickMembers")) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Permission Error")
        .setDescription("I don't have permission to kick members.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [noPermissionEmbed],
        ephemeral: true,
      });
    }

    // Check if the bot can kick the member (role hierarchy check)
    if (
      member.roles.highest.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      const hierarchyErrorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Kick Error")
        .setDescription("I can't kick this member due to role hierarchy.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [hierarchyErrorEmbed],
        ephemeral: true,
      });
    }

    // Check if the user is trying to kick themselves or the bot
    if (member.id === interaction.user.id) {
      const selfKickEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Kick Error")
        .setDescription("You cannot kick yourself!")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [selfKickEmbed], ephemeral: true });
    }

    if (member.id === interaction.client.user.id) {
      const botKickEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Kick Error")
        .setDescription("I cannot kick myself.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [botKickEmbed], ephemeral: true });
    }

    try {
      // Kick the member
      await member.kick(reason);

      // Success embed
      const successEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Member Kicked")
        .setDescription(`<@${member.user.id}> has been kicked.`)
        .addFields({ name: "Reason", value: reason })
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);

      // Error embed
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Kick Error")
        .setDescription(
          "There was an error kicking the member. Please try again."
        )
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

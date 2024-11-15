const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member for a specified duration")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Select the member to timeout")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the timeout in minutes")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the timeout")
        .setRequired(false)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("member");
    const duration = interaction.options.getInteger("duration");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    // Validate timeout duration
    if (duration <= 0 || duration > 10080) {
      const invalidDurationEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Invalid Duration")
        .setDescription(
          "Timeout duration must be between 1 and 10080 minutes (7 days)."
        )
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [invalidDurationEmbed],
        ephemeral: true,
      });
    }

    // Check if the bot has permission to timeout members
    if (!interaction.guild.members.me.permissions.has("ModerateMembers")) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Permission Error")
        .setDescription("I don't have permission to timeout members.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [noPermissionEmbed],
        ephemeral: true,
      });
    }

    // Check if the user is trying to timeout themselves or the bot
    if (member.id === interaction.user.id) {
      const selfTimeoutEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Timeout Error")
        .setDescription("You cannot timeout yourself!")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [selfTimeoutEmbed], ephemeral: true });
    }

    if (member.id === interaction.client.user.id) {
      const botTimeoutEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Timeout Error")
        .setDescription("I cannot timeout myself.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [botTimeoutEmbed], ephemeral: true });
    }

    try {
      // Set the timeout duration (in milliseconds)
      const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds

      // Timeout the member
      await member.timeout(timeoutDuration, reason);

      // Success embed
      const successEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Member Timed Out")
        .setDescription(`<@${member.user.id}> has been timed out.`)
        .addFields(
          { name: "Duration", value: `${duration} minutes` },
          { name: "Reason", value: reason }
        )
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);

      // Error embed
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Timeout Error")
        .setDescription(
          "There was an error timing out the member. Please try again."
        )
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

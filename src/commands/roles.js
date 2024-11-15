// commands/roles.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Replies with your roles")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a Role to view its details")
        .setRequired(false)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Select a role to view details")
        .setRequired(false)
    ),

  async execute(interaction) {
    const userOption = interaction.options.getUser("user") || null;
    const roleOption = interaction.options.getRole("role") || null;

    if (roleOption) {
      // Get all members with the selected role, excluding the command user and bot
      const roleMembers = interaction.guild.members.cache
        .filter(
          (member) =>
            member.roles.cache.has(roleOption.id) &&
            member.id !== interaction.user.id && // Exclude the user who triggered the command
            member.id !== interaction.client.user.id // Exclude the bot
        )
        .map((member) => `<@${member.id}>`)
        .join(", ");

      console.log(roleMembers);

      // Create an embed to display role details
      const embed = new EmbedBuilder()
        .setColor(roleOption.color || "#0099ff") // Use default color if role color is not available
        .setTitle(`${roleOption.name}`)
        .addFields({
          name: "Members with this role",
          value: roleMembers || "No members with this role",
          inline: false, // You can choose whether you want this field to be inline or not
        })
        .setFooter({ text: "Requested by " + interaction.user.username });

      // Send the embed
      return interaction.reply({ embeds: [embed] });
    }

    const roles = interaction.guild.roles.cache;

    if (userOption) {
      // If a user is selected, display the details of the role they are assigned to
      const user = interaction.guild.members.cache.get(userOption.id);
      const userRoles = user.roles.cache.map((role) => role.id);

      // Embed for the user's roles
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(`${userOption.username}'s Roles`)
        .setDescription(
          userRoles.map((role) => `<@&${role}>`).join("\n") ||
            "No roles assigned"
        )
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({ embeds: [embed] });
    }

    // If no user is selected, display all roles in the guild
    const roleList = roles
      .filter((role) => role.name !== "@everyone") // Exclude @everyone role
      .map((role) => `<@&${role.id}>`)
      .join("\n");

    // Embed for all roles
    const embed = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("All Roles in this Server")
      .setDescription(roleList || "No roles available")
      .setFooter({ text: "Requested by " + interaction.user.username });

    return interaction.reply({ embeds: [embed] });
  },
};

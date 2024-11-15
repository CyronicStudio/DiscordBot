const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Adds a role to a member")
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Select the member to assign the role to")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Select the role to assign")
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("member");
    const role = interaction.options.getRole("role");

    // Check if the bot has permission to manage roles
    if (!interaction.guild.members.me.permissions.has("ManageRoles")) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Permission Error")
        .setDescription("I don't have permission to manage roles.")
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [noPermissionEmbed],
        ephemeral: true,
      });
    }

    // Check if the role is higher than the bot's highest role
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      const roleHierarchyEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Role Assignment Error")
        .setDescription(
          "I can't assign a role that is equal to or higher than my highest role."
        )
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [roleHierarchyEmbed],
        ephemeral: true,
      });
    }

    // Check if the member already has the role
    if (member.roles.cache.has(role.id)) {
      const alreadyHasRoleEmbed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("Role Assignment")
        .setDescription(
          `<@${member.user.id}> already has the <@&${role.id}> role.`
        )
        .setFooter({ text: "Requested by " + interaction.user.username });

      return interaction.reply({
        embeds: [alreadyHasRoleEmbed],
        ephemeral: true,
      });
    }

    try {
      // Add the role to the member
      await member.roles.add(role);

      // Success embed
      const successEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Role Assigned")
        .setDescription(
          `Successfully added the <@&${role.id}> role to <@${member.user.id}>!`
        )
        .setFooter({
          text: "Requested by " + interaction.user.username,
        });

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);

      // Error embed
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Assignment Error")
        .setDescription(
          "There was an error assigning the role. Please try again."
        )
        .setFooter({
          text: "Requested by " + `<@${interaction.user.username}>`,
        });

      return interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
    }
  },
};

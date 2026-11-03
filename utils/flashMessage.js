const PAST = {
  create: "added",
  update: "updated",
  delete: "deleted",
  block: "blocked",
  unblock: "unblocked",
  restore: "restored",
};

/**
 * flashSuccess(req, "Planet", "delete", "Mars")
 * -> Planet "Mars" has been deleted successfully.
 */
exports.flashSuccess = (req, entity, action, name) => {
  const label = name ? `${entity} "${name}"` : entity;
  req.flash("success", `${label} has been ${PAST[action] || action} successfully.`);
};

exports.flashError = (req, message) => {
  req.flash("error", message);
};
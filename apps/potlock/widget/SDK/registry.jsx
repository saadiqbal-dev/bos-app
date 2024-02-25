return ({ env }) => {
  const contractId = env === "staging" ? "registry.staging.potlock.near" : "registry.potlock.near";

  const PotlockRegistrySDK = {
    getContractId: () => contractId,
    getConfig: () => {
      return Near.view(contractId, "get_config", {});
    },
    isRegistryAdmin: (accountId) => {
      const config = PotlockRegistrySDK.getConfig();
      return config.admins && config.admins.includes(accountId);
    },
    setProjectStatus: (projectId, status, reviewNotes) => {
      return Near.call([
        {
          contractName: contractId,
          methodName: "admin_set_project_status",
          args: {
            project_id: projectId,
            status,
            review_notes: reviewNotes,
          },
          deposit: NEAR.toIndivisible(0.01).toString(),
        },
      ]);
    },
    getProjects: () => {
      return Near.view(contractId, "get_projects", {});
    },
    getProjectById: (projectId) => {
      return Near.view(contractId, "get_project_by_id", { project_id: projectId });
    },
    isProjectApproved: (projectId) => {
      const project = PotlockRegistrySDK.getProjectById(projectId);
      return project && project.status === "Approved";
    },
    isUserRegistryAdmin: (accountId) => {
      return PotlockRegistrySDK.isRegistryAdmin(accountId);
    },
  };
  return PotlockRegistrySDK;
};

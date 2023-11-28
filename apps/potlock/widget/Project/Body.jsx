const ownerId = "potlock.near";
const IPFS_BASE_URL = "https://nftstorage.link/ipfs/";

const profile = props.profile;

if (!profile) return "Loading...";

const loraCss = fetch("https://fonts.cdnfonts.com/css/lora").body;

// const tags = Object.keys(profile.tags ?? {});
const tags = [profile.category.text ?? props.CATEGORY_MAPPINGS[profile.category] ?? ""];

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;

  @media screen and (max-width: 768px) {
    max-width: 90vw;
  }
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Name = styled.div`
  font-size: 48px;
  font-weight: 500;
  color: #2e2e2e;
  line-height: 56px;
  font-family: "Lora";
  ${loraCss}

  @media screen and (max-width: 768px) {
    font-size: 32px;
    line-height: 40px;
  }
`;

const AccountInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 16px;
`;

const AccountId = styled.div`
  color: #7b7b7b;
  font-size: 16px;
  font-weight: 400;

  @media screen and (max-width: 768px) {
    font-size: 14px;
    line-height: 24px;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
`;

const ShareIconContainer = styled.svg`
  width: 24px;
  height: 24px;

  @media screen and (max-width: 768px) {
    width: 16px;
    height: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  // gap: 16px;
  width: 100%;
`;

const ShareIcon = (
  <ShareIconContainer>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      fill="currentColor"
      viewBox="0 0 16 16"
      stroke="currentColor"
      strokeWidth="0.363"
    >
      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
    </svg>
  </ShareIconContainer>
);

const projectLink = `https://near.social/potlock.near/widget/Index?tab=project&projectId=${
  props.projectId
}${context.accountId && `&referrerId=${context.accountId}`}`;

const Actions = () => (
  <Widget
    src={`${ownerId}/widget/Project.Actions`}
    props={{
      ...props,
    }}
  />
);

const policy = Near.view("lachlan-dao.sputnik-dao.near", "get_policy", {}); // TODO: CHANGE BACK TO PROPS.PROJECT ID
const isDao = !!policy;

const userHasPermissions = useMemo(() => {
  if (!policy) return false;
  // TODO: break this out (NB: duplicated in Project.CreateForm)
  const userRoles = policy.roles.filter((role) => {
    if (role.kind === "Everyone") return true;
    return role.kind.Group && role.kind.Group.includes(context.accountId);
  });
  const kind = "call";
  const action = "AddProposal";
  // Check if the user is allowed to perform the action
  const allowed = userRoles.some(({ permissions }) => {
    return (
      permissions.includes(`${kind}:${action}`) ||
      permissions.includes(`${kind}:*`) ||
      permissions.includes(`*:${action}`) ||
      permissions.includes("*:*")
    );
  });
  return allowed;
}, [policy]);

return (
  <BodyContainer>
    <Header>
      <NameContainer>
        <Name>{profile.name}</Name>
        {props.projectId === context.accountId ||
          (isDao && userHasPermissions && (
            <Widget
              src={`${ownerId}/widget/Components.Button`}
              props={{
                type: "secondary",
                text: "Edit profile",
                disabled: false,
                href: `?tab=editproject&projectId=${props.projectId}`,
              }}
            />
          ))}
      </NameContainer>
      <AccountInfoContainer>
        <AccountId>@{props.projectId}</AccountId>
        <Widget
          src={`${ownerId}/widget/Project.Share`}
          props={{
            text: projectLink,
            // label: "Share",
            clipboardIcon: ShareIcon,
          }}
        />
      </AccountInfoContainer>
      <Widget
        src={`${ownerId}/widget/Project.Tags`}
        props={{
          ...props,
          tags,
        }}
      />
    </Header>
    <Actions />
    <Widget
      src={`${ownerId}/widget/Project.NavOptionsMobile`}
      props={{
        ...props,
      }}
    />
    <div style={{ width: "100%" }}>
      <Widget
        src={props.navOptions.find((option) => option.id == props.nav).source}
        props={{
          ...props,
        }}
      />
    </div>
  </BodyContainer>
);

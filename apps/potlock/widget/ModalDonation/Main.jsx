const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
  box-shadow: 0px 0px 0px 1px rgba(41, 41, 41, 0.1), 0px 8px 12px -4px rgba(41, 41, 41, 0.1),
    0px 20px 32px -10px rgba(41, 41, 41, 0.1), 0px 32px 44px -16px rgba(41, 41, 41, 0.1);
  overflow: hidden;
  border-radius: 6px;
`;

const Banner = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  gap: 0.5rem;
  overflow: hidden;
  background: #dd3345;
  color: white;
  font-size: 22px;
  .left-pattern {
    position: absolute;
    left: 0;
    top: 0;
    width: 30%;
    transform: translate(-10%, -10%) scaleX(-1);
    pointer-events: none;
  }
  .right-pattern {
    position: absolute;
    right: 0;
    top: 0;
    width: 30%;
    transform: translate(10%, -10%);
    pointer-events: none;
  }
`;

const BannerBg = (props) => (
  <svg {...props} viewBox="0 0 145 152" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="157.654"
      y="-37"
      width="20"
      height="161.118"
      rx="10"
      transform="rotate(45 157.654 -37)"
      fill="white"
      fill-opacity="0.08"
    />
    <rect
      x="189.654"
      y="-37"
      width="20"
      height="245.972"
      rx="10"
      transform="rotate(45 189.654 -37)"
      fill="white"
      fill-opacity="0.08"
    />
    <rect
      x="221.654"
      y="-37"
      width="20"
      height="164.654"
      rx="10"
      transform="rotate(45 221.654 -37)"
      fill="white"
      fill-opacity="0.08"
    />
    <rect
      x="125.654"
      y="-37"
      width="20"
      height="177.702"
      rx="10"
      transform="rotate(45 125.654 -37)"
      fill="white"
      fill-opacity="0.08"
    />
    <rect
      x="93.6543"
      y="-37"
      width="20"
      height="78.4889"
      rx="10"
      transform="rotate(45 93.6543 -37)"
      fill="white"
      fill-opacity="0.08"
    />
  </svg>
);

const HeaderIcons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  svg {
    width: 14px;
    cursor: pointer;
    transition: all 300ms ease-in-out;
  }
  .close-icon {
    margin-left: auto;
    &:hover {
      rotate: 90deg;
    }
  }
  svg:first-of-type {
    transform: translateX(-4px);
  }
`;

const DENOMINATION_OPTIONS = [{ text: "NEAR", value: "NEAR", decimals: 24 }];

const { recipientId, referrerId, potId, onClose, NADABOT_CONTRACT_ID, POT } = props;

const DEFAULT_DONATION_AMOUNT = "1";

const initialState = {
  amount: DEFAULT_DONATION_AMOUNT,
  donationType: "direct",
  showBreakdown: false,
  bypassProtocolFee: false,
  bypassChefFee: false,
  addNote: false,
  donationNote: "",
  donationNoteError: "",
  allPots: null,
  detailForPots: {},
  approvedProjectsForPots: {},
  activeRoundsForProject: potId ? [potId] : null, // mapping of potId to { potDetail }
  intervalId: null,
  ftBalances: null,
  selectedDenomination: DENOMINATION_OPTIONS[0],
  denominationOptions: DENOMINATION_OPTIONS,
  selectedRound: "",
  currentPage: "confirm",
};

State.init(initialState);

const {
  amount,
  denomination,
  donationType,
  showBreakdownm,
  bypassProtocolFee,
  bypassChefFee,
  addNote,
  donationNote,
  donationNoteError,
  allPots,
  detailForPots,
  approvedProjectsForPots,
  activeRoundsForProject,
  intervalId,
  nearBalance,
  ftBalances,
  denominationOptions,
  selectedDenomination,
  selectedRound,
  currentPage,
} = state;

const [activeRounds, setActiveRounds] = useState(null);

const profile = Social.getr(`${recipientId}/profile`);
const profileName = profile?.name || recipientId;

const MAX_NOTE_LENGTH = 60;

const { ownerId, DONATION_CONTRACT_ID, NADABOT_HUMAN_METHOD, NADA_BOT_URL, SUPPORTED_FTS } =
  VM.require("potlock.near/widget/constants") || {
    DONATION_CONTRACT_ID: "",
    NADABOT_HUMAN_METHOD: "",
    ownerId: "",
    NADA_BOT_URL: "",
    SUPPORTED_FTS: {},
  };

let ListsSDK =
  VM.require("potlock.near/widget/SDK.lists") ||
  (() => ({
    getRegistrations: () => {},
  }));
ListsSDK = ListsSDK({ env: props.env });

const projects = ListsSDK.getRegistrations() || [];

let DonateSDK =
  VM.require("potlock.near/widget/SDK.donate") ||
  (() => ({
    getConfig: () => {},
    asyncGetDonationsForDonor: () => {},
  }));
DonateSDK = DonateSDK({ env: props.env });

let PotFactorySDK =
  VM.require("potlock.near/widget/SDK.potfactory") ||
  (() => ({
    getPots: () => {},
  }));

PotFactorySDK = PotFactorySDK({ env: props.env });

const PotSDK = VM.require("potlock.near/widget/SDK.pot") || {
  getConfig: () => {},
  asyncGetConfig: () => {},
  getApprovedApplications: () => {},
  asyncGetApplicationByProjectId: () => {},
  asyncGetDonationsForDonor: () => {},
  isRoundActive: () => {},
};

const { nearToUsd, formatWithCommas } = VM.require("potlock.near/widget/utils") || {
  nearToUsd: 1,
  formatWithCommas: () => {},
};

const { addItemsToCart, clearCart } = VM.require("potlock.near/widget/SDK.cart") || {
  addItemsToCart: () => {},
  clearCart: () => {},
};

const { FormPage } = VM.require("potlock.near/widget/ModalDonation.Form") || {
  FormPage: () => {},
};
const { ConfirmPage } = VM.require("potlock.near/widget/ModalDonation.ConfirmPage") || {
  ConfirmPage: () => {},
};

const pages = {
  form: FormPage,
  confirm: ConfirmPage,
};

const ActivePageComponent = pages[currentPage];

// get all active pots
const pots = useCache(
  () =>
    // get all pots
    PotFactorySDK.asyncGetPots()
      .then((pots) => {
        const activePots = pots.map((pot) =>
          // if active
          PotSDK.isRoundActive(pot.id)
            // check if project had applied
            .then((isActive) => isActive && pot.id)
            .catch((e) => {
              console.error("error checking active round for pot: " + pot.id, e);
            })
        );
        return Promise.all(activePots);
      })
      .catch((e) => {
        console.error("error getting pots: ", e);
      }),
  "active-pots"
);

if (!activeRound && !activeRounds) {
  (pots ?? []).forEach((pot, idx) => {
    if (pot) {
      PotSDK.asyncGetApplicationByProjectId(pot, recipientId)
        .then((application) => {
          if (application.status === "Approved") {
            setActiveRounds((prev) => {
              const prevRounds = prev || [];
              if (!prevRounds.includes(pot)) {
                return [...prevRounds, pot];
              }
            });
            if (!selectedRound)
              State.update({
                selectedRound: pot,
              });
          } else if (pots.length - 1 === idx && !activeRounds) {
            setActiveRounds((prev) => [...(prev || [])]);
          }
        })
        .catch((err) => {});
    }
  });
}
// Get Ft Balances
useEffect(() => {
  if (!ftBalances) {
    asyncFetch(
      `https://near-mainnet.api.pagoda.co/eapi/v1/accounts/${context.accountId}/balances/FT`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "dce81322-81b0-491d-8880-9cfef4c2b3c2",
        },
      }
    )
      .then((ftBalancesRes) => {
        if (ftBalancesRes) {
          const ftBalances = ftBalancesRes.body.balances;
          State.update({
            ftBalances: ftBalances,
            denominationOptions: DENOMINATION_OPTIONS.concat(
              ftBalances
                .map(({ amount, contract_account_id, metadata }) => ({
                  amount,
                  id: contract_account_id,
                  text: metadata.symbol,
                  value: metadata.symbol,
                  icon: metadata.icon,
                  decimals: metadata.decimals,
                }))
                .filter((option) => option.text.length < 10)
            ),
          });
        }
      })
      .catch((err) => console.log("fetching Ft balances faild"));
  }
}, [ftBalances]);

const nearBalanceRes = fetch(
  `https://near-mainnet.api.pagoda.co/eapi/v1/accounts/${context.accountId}/balances/NEAR`,
  {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "dce81322-81b0-491d-8880-9cfef4c2b3c2",
    },
  }
);

const ftBalance = useMemo(() => {
  if (selectedDenomination.text === "NEAR") {
    const nearBalance = nearBalanceRes?.body?.balance;

    return nearBalance
      ? formatWithCommas(Big(nearBalance.amount).div(Big(10).pow(24)).toFixed(2))
      : "-";
  }
  const balance = denominationOptions.find(
    // this is where we need the details
    (option) => option.text === selectedDenomination.text
  );
  return balance
    ? formatWithCommas(Big(balance.amount).div(Big(10).pow(balance.decimals)).toFixed(2))
    : "-";
}, [selectedDenomination, ftBalances, nearBalanceRes]);

return (
  <Widget
    src={`${ownerId}/widget/Components.Modal`}
    props={{
      ...props,
      onClose: (e) => {
        e.stopPropagation();
      },
      contentStyle: {
        padding: "0px",
      },
      children: (
        <Container>
          <Banner>
            <BannerBg className="left-pattern" />
            <BannerBg className="right-pattern" />
            <HeaderIcons>
              {currentPage !== "form" && (
                <svg
                  onClick={() =>
                    State.update({
                      currentPage: "form",
                    })
                  }
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 7H3.83L9.42 1.41L8 0L0 8L8 16L9.41 14.59L3.83 9H16V7Z"
                    fill="#FCCFCF"
                  />
                </svg>
              )}

              <svg
                onClick={() => onClose()}
                className="close-icon"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                  fill="#FCCFCF"
                />
              </svg>
            </HeaderIcons>
            {currentPage !== "form" ? (
              <div> Confirm donation</div>
            ) : (
              <div> Donate to {profileName}</div>
            )}
          </Banner>
          <ActivePageComponent
            {...props}
            {...state}
            updateState={State.update}
            ftBalance={ftBalance}
            activeRounds={activeRounds}
          />
        </Container>
      ),
    }}
  />
);

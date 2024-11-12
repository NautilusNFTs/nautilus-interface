import React from "react";
import styled from "styled-components";
import LightLogo from "../../static/logo-light.svg";
import DarkLogo from "../../static/logo-dark.svg";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Grid, Stack, TextField, Button, useMediaQuery, useTheme } from "@mui/material";
import { Link } from "react-router-dom";

const FooterRoot = styled.footer`
  position: absolute;
  padding: 64px 80px;
  border-top: 1px solid #eaebf0; /* Border color set to #EAEBF0 */
  padding-bottom: 80px;
  padding-right: 0px;
  padding-left: 80px;
`;

const FooterContainer = styled.div`
  width: 1280px; /* Fill (1,280px) */
  height: fit-content; /* Hug (412px) */
  gap: 64px;
  display: flex;
  flex-direction: column;
`;

const HorizontalContainer = styled.div`
  width: 1280px; /* Fill (1,280px) */
  height: fit-content; /* Hug (292px) */
  display: flex;
  justify-content: space-between; /* Justify: space-between */
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: fit-content; /* Hug (292px) */
  gap: 16px;
`;

const BrandLogo = styled.img`
  width: 140px;
  height: 28px;
`;

const Description = styled.div`
  font-family: Inter;
  font-size: 16px;
  font-weight: 200;
  line-height: 24px;
  letter-spacing: 0px;
  text-align: left;
  color: #68727d;
`;

const FooterHeading = styled.h3`
  font-family: Nohemi;
  font-size: 24px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0px;
  text-align: left;
`;

const Copyright = styled.div`
  font-family: Inter;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0px;
  text-align: center;
  width: 303px;
  height: 24px;
  color: #68727d;
`;

const FooterLink = styled.li`
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  text-align: left;
  color: #68727d;
  margin-top: 15px;
`;

const FooterList = styled.ul`
  padding: 0px;
  list-style: none;
`;

const SocialContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  margin-top: 20px;
`;

const SubmitContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-self: stretch;
`;

const EmailInput = styled.input`
  flex-grow: 1;
  border: 1px solid #EAEBF0;
  border-radius: 6px 0px 0px 6px;
  padding: 12px 16px 12px 16px;
`

const EmailSubmit = styled.button`
  width: 90px;
  border: none;
  border-radius: 0px 6px 6px 0px;
  padding: 12px 16px 12px 16px;
  background: #9933FF;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  color: white;
`

const SocialHeading = styled.div`
  color: #161717;
  font-family: Nohemi;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px; /* 100% */
`;

const SocialButtonGroup = styled.div`
  display: flex;
  align-items: flex-end;
  gap: var(--Main-System-20px, 20px);
`;

const XIcon = () => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.545847 0L11.7696 16.3631L0 30H2.50874L12.8814 17.9821L21.1246 30H29.0301L17.2852 12.8783L28.401 0H25.8938L16.175 11.2593L8.45138 0H0.545847Z"
        fill="white"
      />
    </svg>
  );
};

const DiscordIcon = () => {
  return (
    <svg
      width="43"
      height="30"
      viewBox="0 0 43 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M36.9658 3.85709C36.364 2.94812 35.512 2.25282 34.5015 1.84863C32.3079 0.969043 30.4214 0.381462 28.7334 0.0502803C27.5494 -0.181191 26.3769 0.401048 25.8133 1.49787L25.6727 1.77207C24.4227 1.63408 23.0953 1.58778 21.5836 1.62607C20.0337 1.58867 18.7018 1.63408 17.4501 1.77207L17.3103 1.49787C16.7468 0.401048 15.5725 -0.180301 14.3911 0.0511705C12.7032 0.381462 10.8158 0.969044 8.62302 1.84953C7.61345 2.25371 6.76146 2.94812 6.15874 3.85798C1.95576 10.2065 0.308751 17.0545 1.12424 24.7946C1.15273 25.0661 1.30408 25.3091 1.53466 25.4543C4.76814 27.493 7.56627 28.8889 10.3404 29.8487C11.5004 30.2537 12.7868 29.8006 13.4715 28.7545L14.692 26.884C13.7198 26.5172 12.7708 26.0828 11.861 25.5638C11.4345 25.3207 11.2858 24.7768 11.5289 24.3503C11.7719 23.9221 12.3159 23.7716 12.7432 24.0182C15.4505 25.562 18.5113 26.3784 21.5943 26.3784C24.6773 26.3784 27.7381 25.562 30.4454 24.0182C30.8719 23.7716 31.4158 23.9221 31.6598 24.3503C31.9028 24.7768 31.7541 25.3207 31.3277 25.5638C30.3876 26.1006 29.4047 26.5475 28.3978 26.9205L29.654 28.7919C30.1712 29.562 31.025 30 31.9046 30C32.1913 30 32.4806 29.9528 32.7619 29.8567C35.544 28.8961 38.3475 27.4983 41.5881 25.4552C41.8187 25.31 41.97 25.0661 41.9985 24.7955C42.8158 17.0545 41.1688 10.2056 36.9658 3.85709ZM15.8752 19.2882C14.1605 19.2882 12.7494 17.4819 12.7494 15.2864C12.7494 13.091 14.1605 11.2847 15.8752 11.2847C17.5899 11.2847 19.001 13.091 19.001 15.2864C19.001 17.4819 17.5899 19.2882 15.8752 19.2882ZM27.4425 19.2651C25.7439 19.2651 24.3462 17.448 24.3462 15.2393C24.3462 13.0305 25.7439 11.2134 27.4425 11.2134C29.1412 11.2134 30.5389 13.0305 30.5389 15.2393C30.5389 17.448 29.1412 19.2651 27.4425 19.2651Z"
        fill="white"
      />
    </svg>
  );
};

const RedditIcon = () => {
  return (
    <svg 
      width="33" 
      height="30" 
      viewBox="0 0 33 30" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.3453 0C17.8414 0 16.0836 1.18025 15.8185 6.45089C16.0417 6.44531 16.2622 6.42857 16.4882 6.42857C16.7393 6.42857 16.9988 6.44252 17.2471 6.45089C17.4173 3.28404 18.1707 1.42857 19.3453 1.42857C19.8476 1.42857 20.1322 1.70201 20.6623 2.27679C21.2817 2.94922 22.0909 3.82255 23.6757 4.15179C23.6506 3.96484 23.631 3.76395 23.631 3.57143C23.631 3.27009 23.6617 2.98549 23.7203 2.70089C22.7382 2.43304 22.2192 1.86663 21.7114 1.31696C21.145 0.703125 20.4949 0 19.3453 0ZM27.9167 0.714286C26.3403 0.714286 25.0596 1.99777 25.0596 3.57143C25.0596 5.14509 26.3403 6.42857 27.9167 6.42857C29.4932 6.42857 30.7739 5.14509 30.7739 3.57143C30.7739 1.99777 29.4932 0.714286 27.9167 0.714286ZM16.4882 7.85714C7.82188 7.85714 0.77389 12.2712 0.77389 18.5714C0.77389 24.8717 7.82188 30 16.4882 30C25.1545 30 32.2025 24.8717 32.2025 18.5714C32.2025 12.2712 25.1545 7.85714 16.4882 7.85714ZM3.98818 8.52679C2.94465 8.52679 1.95414 8.95368 1.198 9.70982C-0.0324718 10.9403 -0.286378 12.7093 0.416747 14.1741C1.49655 12.0843 3.3548 10.3013 5.75157 8.97321C5.20748 8.69699 4.6048 8.52679 3.98818 8.52679ZM28.9882 8.52679C28.3715 8.52679 27.7689 8.69699 27.2248 8.97321C29.6215 10.3013 31.4798 12.0843 32.5596 14.1741C33.2627 12.7093 33.0088 10.9403 31.7784 9.70982C31.0222 8.95368 30.0317 8.52679 28.9882 8.52679ZM10.7739 14.2857C11.9569 14.2857 12.9167 15.2455 12.9167 16.4286C12.9167 17.6116 11.9569 18.5714 10.7739 18.5714C9.59085 18.5714 8.63103 17.6116 8.63103 16.4286C8.63103 15.2455 9.59085 14.2857 10.7739 14.2857ZM22.2025 14.2857C23.3855 14.2857 24.3453 15.2455 24.3453 16.4286C24.3453 17.6116 23.3855 18.5714 22.2025 18.5714C21.0194 18.5714 20.0596 17.6116 20.0596 16.4286C20.0596 15.2455 21.0194 14.2857 22.2025 14.2857ZM10.1042 22.1429C10.2828 22.1735 10.4586 22.274 10.573 22.433C10.6483 22.5391 12.3224 24.7768 16.4882 24.7768C20.7097 24.7768 22.3866 22.4777 22.4034 22.4554C22.6294 22.1345 23.0842 22.048 23.4078 22.2768C23.7287 22.5028 23.7901 22.9353 23.5641 23.2589C23.4804 23.3789 21.4435 26.2054 16.4882 26.2054C11.53 26.2054 9.49599 23.3789 9.41228 23.2589C9.18628 22.9353 9.24487 22.5028 9.56853 22.2768C9.73036 22.1624 9.92568 22.1122 10.1042 22.1429Z" fill="white"/>
    </svg>
  );
};

const TelegramIcon = () => {
  return (
    <svg 
      width="34" 
      height="30" 
      viewBox="0 0 34 30" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M33.2997 0.412412C32.7372 -0.0645891 31.8537 -0.132839 30.9402 0.233912H30.9387C29.978 0.619413 3.7429 11.8724 2.6749 12.3322C2.48065 12.3997 0.784145 13.0327 0.958896 14.4427C1.1149 15.714 2.4784 16.2405 2.6449 16.3012L9.31467 18.585C9.75717 20.058 11.3884 25.4925 11.7492 26.6535C11.9742 27.3772 12.3409 28.3282 12.9837 28.524C13.5477 28.7415 14.1087 28.5427 14.4717 28.2577L18.5494 24.4755L25.1322 29.6092L25.289 29.703C25.736 29.901 26.1642 30 26.573 30C26.8887 30 27.1917 29.9408 27.4812 29.8222C28.4675 29.4172 28.862 28.4775 28.9032 28.371L33.8202 2.81317C34.1202 1.44817 33.7032 0.753663 33.2997 0.412412ZM15.1969 19.4985L12.9469 25.4985L10.6969 17.9985L27.947 5.24843L15.1969 19.4985Z" fill="white"/>
    </svg>
  );
};

const IconContainer = styled.div`
  display: flex;
  padding: var(--Main-System-15px, 15px);
  align-items: flex-start;
  gap: var(--Main-System-10px, 10px);
  border-radius: 100px;
  background: #93f;
  width: 30px;
`;

const Footer: React.FC = () => {
  const isDarkTheme = useSelector(
    (state: RootState) => state.theme.isDarkTheme
  );

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <FooterRoot
      style={{ 
        background: isDarkTheme ? "rgb(22, 23, 23)" : undefined, 
        padding: isSmallScreen ? "20px 20px":"80px"
      }}
    >
      <Grid container spacing={10}>
        <Grid item xs={12} sm={12} md={6}>
          <Container>
            <BrandLogo src={isDarkTheme ? DarkLogo : LightLogo} />
            <Description>
              Join Nautilus and explore the dynamic world of digital art.
              Immerse yourself in a vibrant community of collectors and
              creators. Experience the thrill of discovery today.
            </Description>
            <SubmitContainer>
              <EmailInput placeholder="Input your Email"/>
              {/* <input type="input" placeholder="Input your Email"/> */}
              {/* <button type="button">Submit</button> */}
              <EmailSubmit>Submit</EmailSubmit>
            </SubmitContainer>
            <SocialContainer>
              <SocialHeading>Join us</SocialHeading>
              <SocialButtonGroup>
                <Link to="https://x.com/NautilusNFTs" target="_blank">
                  <IconContainer>
                    <XIcon />
                  </IconContainer>
                </Link>
                <Link to="#" target="_blank">
                  <IconContainer>
                    <RedditIcon />
                  </IconContainer>
                </Link>
                <Link to="#" target="_blank">
                  <IconContainer>
                    <TelegramIcon />
                  </IconContainer>
                </Link>
                <Link to="https://discord.gg/qp3FT47txs" target="_blank">
                  <IconContainer>
                    <DiscordIcon />
                  </IconContainer>
                </Link>
              </SocialButtonGroup>
            </SocialContainer>
          </Container>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Grid container>
            <Grid item xs={6} md={6}>
              <FooterHeading
                style={{
                  color: isDarkTheme ? "white" : undefined,
                  margin: '0px'
                }}
              >
                Marketplace
              </FooterHeading>
              <FooterList>
                <FooterLink>Collections</FooterLink>
                <FooterLink>Auctions</FooterLink>
                <FooterLink>Our Competition</FooterLink>
                <FooterLink>Buy</FooterLink>
                <FooterLink>Sell</FooterLink>
                <FooterLink>Activity</FooterLink>
              </FooterList>
            </Grid>
            <Grid item xs={6} md={6}>
              <FooterHeading
                style={{
                  color: isDarkTheme ? "white" : undefined,
                  margin: '0px'
                }}
              >
                Links
              </FooterHeading>
              <FooterList>
                <FooterLink>Privacy Policy</FooterLink>
                <FooterLink>Terms</FooterLink>
                <FooterLink>Community guidelines</FooterLink>
                <FooterLink>Report a Bug</FooterLink>
              </FooterList>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} display={'flex'} justifyContent={'center'}>
          <Copyright>© 2024 Voi Market. All Rights Reserved.</Copyright>
        </Grid>
      </Grid>
    </FooterRoot>
  );
};

export default Footer;

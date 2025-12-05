// app/page.tsx
"use client";

import styled from "styled-components";


const MainContainer = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px; 
    background-color: #f8fafc; 
`;

const ContentCard = styled.div`
    width: 100%;
    max-width: 500px;
    text-align: center;
    padding: 40px; 
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
`;

const Heading = styled.h1`
    font-size: 40px; 
    font-weight: 800;
    color: #4f46e5; 
    margin-bottom: 16px; 
`;

const Subtitle = styled.p`
    font-size: 18px;
    color: #475569; 
    margin-bottom: 32px;
`;

const CallToActionLink = styled.a`
    display: inline-block;
    padding: 12px 24px;
    font-size: 18px; 
    font-weight: 600;
    color: white;
    background-color: #10b981; 
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

`;

const SecondaryText = styled.p`
    font-size: 14px; 
    color: #64748b;
    margin-top: 16px; 
`;


export default function HomePage() {
    return (
        <MainContainer>
            <ContentCard>
                <Heading>
                     BudgetBuddy
                </Heading>

                <Subtitle>
                    Your simple and reliable tool for tracking income and expenses.
                </Subtitle>

                <div>
                    <CallToActionLink href="/transactions">
                        View My Transactions
                    </CallToActionLink>

                    <SecondaryText>
                        Click above to manage your finances.
                    </SecondaryText>
                </div>
            </ContentCard>
        </MainContainer>
    );
}
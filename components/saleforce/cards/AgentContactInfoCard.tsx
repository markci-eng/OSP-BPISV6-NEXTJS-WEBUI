import Card from "@/components/cards/Card";
import { SalesAgent } from "@/components/common/agent-lookup/agent-lookup.type";
import LabelText from "@/components/texts/LabelText";
import { Flex, Separator } from "@chakra-ui/react";


interface AgentContactInfoCardProps {
  agent: SalesAgent | undefined | null;
  removeCard?: Boolean;
}

const AgentContactInfo = ({ agent }: AgentContactInfoCardProps) => {
  return (
    <>
        {agent && (
            <Flex direction="column" gap={2}>
                <LabelText label="Email" value={agent.email} />
                <Separator />
                <LabelText label="Mobile Number" value={agent.mobile} />
                <Separator />
                <LabelText label="Landline Number" value={agent.landline} />
            </Flex>
        )}
    </>
  )
};

const AgentContactInfoInCard = ({ agent }: AgentContactInfoCardProps) => {
  return (
    <Card.Root title="Contact Information">
        <Card.MainContent>
            <AgentContactInfo agent={agent} />
        </Card.MainContent>
    </Card.Root>
  );
};

const AgentContactInfoCard = ({ agent, removeCard }: AgentContactInfoCardProps) => {
    return (
        <>
            {removeCard ? (
                <AgentContactInfo agent={agent} />
            ) : (
                <AgentContactInfoInCard agent={agent} />
            )}
        </>
    )
}
export default AgentContactInfoCard;

import { Avatar, Badge, Flex, Grid, Strong } from '@chakra-ui/react'
import { Box } from 'st-peter-ui'
import InfoItem from '../common/info-item/info-item'

const ClaimPlanholderDetail = () => {
  return (
    <Box width={"full"} my={5} p={5} boxShadow={"sm"} borderRadius={"md"}>
        <Flex flexDirection="column" gap={4}>
            <Flex gap={2} alignItems="center">
                <Box>
                    <Avatar.Root size={"lg"}>
                        <Avatar.Fallback name={"Segun Adebayo"} />
                        {/* <Avatar.Image src="https://bit.ly/sage-adebayo" /> */}
                    </Avatar.Root>
                </Box>

                <Flex flexDirection="column">
                    <Strong color="gray.700">Segun Adebayo</Strong>
                    <Flex flexDirection="row" gap={1}>
                        <Badge background="gray.200" color="gray.600">L25053157I</Badge>
                        <Badge background="green.200" color="green.500">Active</Badge>
                    </Flex>
                </Flex>
            </Flex>

            <Grid templateColumns={{base:"1fr", md:"repeat(2, 1fr)"}} gap={2}>
                <InfoItem label="Plan" value="ST.GEORGE" />
                <InfoItem label="Mode" value="MONTHLY" />
                <InfoItem label="Term" value="5 YEARS" />
                <InfoItem label="Plan Code" value="LG5M6" />
                <InfoItem label="Plan Class" value="REGULAR" />
                <InfoItem label="Account Class" value="REGULAR" />
                <InfoItem label="Effectivity Date" value="2000-01-01" />
                <InfoItem label="New Effectivity Date" value="1900-01-01" />
            </Grid>
        </Flex>
    </Box>
  )
}

export default ClaimPlanholderDetail

'use client'

import React, { useState } from 'react'
import { Box, H4, InputFloatingLabel } from 'st-peter-ui'
import { Flex, Grid, GridItem, Separator, Strong, Text } from '@chakra-ui/react'
import { SearchPlanholderDialog } from '@/components/common/planholder-lookup/search-planholder-dialog'
import ClaimApplicationForm from '@/components/claim-application/claim-application-form'
import ClaimPlanholderDetail from '@/components/claim-application/claim-planholder-detail'

const ClaimApplicationPage = () => {
    const [selectedPlanholder, setSelectedPlanholder] = useState<string | null>(null);
 
    return (
        <Flex as="div" flexDir="column" gap={2} width="full" height="100%">
            <Strong color="gray.700">Manage Claim</Strong>

            <Box  
                p={4}
                mt={5}
                bg={"#fff"}
                boxShadow={"sm"}
                borderTopLeftRadius="lg" 
                borderTopEndRadius="lg" 
                borderBottomLeftRadius={"sm"} 
                borderBottomEndRadius={"sm"}>
                <Strong color="gray.700">Search Planholder</Strong>
                <Separator my={2} />
                <SearchPlanholderDialog onSelectChange={(lpaNo) => setSelectedPlanholder(lpaNo)}/>
            </Box>

            <Box
                p={4}
                mt={5}
                bg={"#fff"}
                boxShadow={"sm"}
                borderTopLeftRadius="sm"
                borderTopEndRadius="sm"
                borderBottomLeftRadius={"lg"}
                borderBottomEndRadius={"lg"}>
                <Grid my={2} gap={6} templateColumns={{ base: "1fr", md: `repeat(3, 1fr)` }}>
                    <GridItem colSpan={2}>
                        <Strong color="gray.700">Claim Application</Strong>
                        <Separator />
                        <ClaimApplicationForm />
                    </GridItem>

                    <GridItem colSpan={1}>
                        <ClaimPlanholderDetail />
                    </GridItem>
                </Grid>
            </Box>
        </Flex>
    )
}

export default ClaimApplicationPage

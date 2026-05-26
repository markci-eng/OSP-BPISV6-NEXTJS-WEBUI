import { Button, createListCollection, Flex, Grid, Separator, Strong } from '@chakra-ui/react'
import React from 'react'
import { LuPlus, LuTrash } from 'react-icons/lu'
import { Body, Box, Checkbox, InputFloatingLabel, PrimarySmButton, SelectFloatingLabel } from 'st-peter-ui'
import ClaimsOverlay from './claim-overlay'
import { OSPBadge } from '../common/badge/badge'

interface CheckBoxData {
    label: string,
    isChecked: boolean,
    isDisabled: boolean
}

interface Payee {
    payeeID: string,
    firstName: string,
    middleName?: string,
    lastName: string,
    suffix: string,
    birthDate: Date
}

const ClaimApplicationForm = () => {
    const [incidentDate, setIncidentDate] = React.useState<Date>();
    const [claimTypeCheckBoxList, setClaimTypeCheckBoxList] = React.useState<CheckBoxData[]>([
        { label: "Cash Assistance Benefit", isChecked: false, isDisabled: false },
        { label: "Extended Cash Assistance Benefit", isChecked: false, isDisabled: false },
        { label: "Dismemberment", isChecked: false, isDisabled: false },
        { label: "Waiver of Installment", isChecked: false, isDisabled: false },
        { label: "Accidental Death Benefit", isChecked: false, isDisabled: false },
        { label: "Unrendered Service Benefit", isChecked: false, isDisabled: false }
    ]);

    const reasonList = createListCollection({
        items: [
            { label: "Heart Disease", value: 1},
            { label: "Stroke", value: 2 },
            { label: "Chronic Obstructive Pulmonary Disease", value: 3 },
            { label: "Respiratory Infections", value: 4 },
            { label: "Cancer", value: 5 },
            { label: "Old Age", value: 6 }
        ]
    })

    const handleClaimTypeCheckBoxChange = (label: string) => {
        var isChecked : boolean = claimTypeCheckBoxList.find(x => x.label === label)?.isChecked ?? false;


        setClaimTypeCheckBoxList(current => 
            current.map(item => item.label === label ? { ...item, isChecked: !item.isChecked } : item)
        );

        setClaimTypeCheckBoxList(current => 
            current.map(item => item.label != label ? {...item, isDisabled: !isChecked} : item)
        )
    }


    const [payeeList, setPayeeList] = React.useState<Payee[]>([]);
    const [payee, setPayee] = React.useState<Payee>({
        payeeID: "",
        firstName: "",
        lastName: "",
        middleName: "",
        suffix: ""
    } as Payee);


    return (
        <Flex flexDirection="column" gap="4">
            <Grid templateColumns={{ base: "1fr", md: `repeat(2, 1fr)` }} gap={2} alignItems="center">
                <InputFloatingLabel label="Incident Date" type="date"/>
                <SelectFloatingLabel label="Cause of Incident" collection={reasonList} />
            </Grid>

            <Flex gap="2" flexDirection="column">
                <Flex flexDirection="column" gap="2">
                    <Strong fontSize="14px" color="gray.700">Select Type of Claim</Strong>
                    <Separator />
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: `repeat(2, 1fr)` }} gap={2}>
                    {
                        claimTypeCheckBoxList.map(item => {
                            return (
                                <Checkbox key={item.label} label={item.label} checked={item.isChecked} disabled={item.isDisabled} onCheckedChange={() => {
                                    handleClaimTypeCheckBoxChange(item.label)
                                }} />
                            )
                        })
                    }
                </Grid>
            </Flex>

            <Flex gap="2" flexDirection="column">
                <Flex flexDirection="column" gap="2">
                    <Flex flexDirection="row" gap="2" alignItems="center" justifyContent="space-between">
                        <Strong fontSize="14px" color="gray.700">Payee List</Strong>
                        <ClaimsOverlay id="create-payee" title='Add New Payee' btnMessage={
                            <>
                                <LuPlus/> Add Payee
                            </>
                        }
                        content={
                            <Grid templateColumns={{ base: "1fr", md: `repeat(2, 1fr)` }} gap={2}>
                                <InputFloatingLabel 
                                    label="Last Name" 
                                    value={payee?.lastName} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newValue = e.target.value;
                                        payee.lastName = newValue;
                                        setPayee((curr) => ({ 
                                            ...curr,
                                            lastName: newValue}))
                                    }}
                                />
                                
                                <InputFloatingLabel 
                                    label="First Name" 
                                    value={payee?.firstName} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newValue = e.target.value;
                                        payee.firstName = newValue;
                                        setPayee((curr) => ({ 
                                            ...curr,
                                            firstName: newValue}))
                                    }}
                                />

                                <InputFloatingLabel 
                                    label="Middle Name" 
                                    value={payee?.middleName} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newValue = e.target.value;
                                        payee.middleName = newValue;
                                        setPayee((curr) => ({ 
                                            ...curr,
                                            middleName: newValue}))
                                    }}
                                />

                                <InputFloatingLabel 
                                    label="Suffix" 
                                    value={payee?.suffix} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const newValue = e.target.value;
                                        payee.suffix = newValue;
                                        setPayee((curr) => ({ 
                                            ...curr,
                                            suffix: newValue}))
                                    }}
                                />
                                <InputFloatingLabel label="Date of Birth" type="date" />
                            </Grid>
                        }
                        
                        onConfirm={() => {
                            const newPayeeRecord: Payee = {
                                ...payee,
                                payeeID: "payeeId" + (payeeList.length + 1).toString()
                            };

                            setPayeeList((curr) => ([...curr, newPayeeRecord]));

                            setPayee({
                                payeeID: "",
                                firstName: "",
                                lastName: "",
                                middleName: "",
                                suffix: "",
                                birthDate: new Date()
                            })
                        }}

                        onCancel={() => {
                            setPayee({
                                payeeID: "",
                                firstName: "",
                                lastName: "",
                                middleName: "",
                                suffix: "",
                                birthDate: new Date()
                            })
                        }}
                        />
                    </Flex>
                    <Separator />

                    {
                        payeeList.length === 0 ? (
                            <Flex 
                                alignItems="center"
                                justifyContent="center"
                                height={100}
                                background="green.100"
                                margin="0 10px"
                            >
                                <Body>Your payee list is currently empty. Please define a payee.</Body>
                            </Flex>
                        ) : (
                            <Grid templateColumns={{ base: "1fr", md: `repeat(2, 1fr)` }} gap="2">
                                {
                                    payeeList.map((item) => 
                                        <OSPBadge p="2">
                                            <Flex flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
                                                <Body>{item.lastName}, {item.firstName} {item.middleName} {item.suffix}</Body>
                                                
                                                <Flex flexDirection="row">
                                                    <Button size="sm" variant="ghost" color="red.500"><LuTrash /></Button>
                                                </Flex>
                                            </Flex>
                                        </OSPBadge>
                                    )
                                }
                            </Grid>
                        )
                    }
                </Flex>
            </Flex>
        </Flex>
    )
}

export default ClaimApplicationForm

import { useEffect, useMemo, useState } from "react"
import { Member } from "../api/auth/members/route"
import { LoadingComponent } from "../UtilsCompnents";
import { handleRemoveMember, loadData } from "./membersFeat";
import { Button, Input, Pagination, Popover, PopoverContent, PopoverTrigger, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

export default function MembersComponent() {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isLoadingButton, setLoadingButton] = useState(false);
    const [search, setSearch] = useState('');
    const [result, setResult] = useState<Member[]>([]);
    const rowsPerPage = 20;

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return result.slice(start, end);
    }, [page, result]);

    useEffect(() => {
        const loadFuns = async () => {
            await loadData(setMembers, setLoading);
        }
        loadFuns();
    }, []);

    useEffect(() => {
        const searchedMembers = members.filter(member => member.id.includes(search) || member.character.includes(search) || member.email.includes(search));
        setResult(searchedMembers);
    }, [members]);

    if (isLoading) {
        return <LoadingComponent heightStyle={'h-[calc(100vh-105px)]'}/>;
    }

    return (
        <div className="w-full">
            <div className="flex justify-end mb-4">
                <div className="flex gap-2 w-full flex-col sm:flex-row">
                    <div className="grow flex gap-3">
                        <div>
                            <p className="fadedtext text-[10pt]">가입한 맴버 수</p>
                            <p className="font-bold text-xl">{members.length}</p>
                        </div>
                        <div>
                            <p className="fadedtext text-[10pt]">검색 결과 개수</p>
                            <p className="font-bold text-xl">{result.length}</p>
                        </div>
                    </div>
                    <Input
                        placeholder="검색 내용을 입력하세요."
                        radius="sm"
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const searchedMembers = members.filter(member => member.id.includes(search) || member.character.includes(search) || member.email.includes(search) || member.expeditions.some(character => character.nickname === search));
                                setResult(searchedMembers);
                            }
                        }}
                        className="w-full sm:w-[240px]"/>
                    <Button
                        radius="sm"
                        color="primary"
                        onPress={() => {
                            const searchedMembers = members.filter(member => member.id.includes(search) || member.character.includes(search) || member.email.includes(search) || member.expeditions.some(character => character.nickname === search));
                            setResult(searchedMembers);
                        }}>
                        검색
                    </Button>
                </div>
            </div>
            <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                <div className="w-[700px] sm:w-full">
                    <Table
                        fullWidth 
                        removeWrapper
                        bottomContent={
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={page}
                                    total={Math.ceil(result.length / rowsPerPage)}
                                    onChange={(page) => setPage(page)}/>
                            </div>
                        }>
                        <TableHeader>
                            <TableColumn>ID</TableColumn>
                            <TableColumn>대표 캐릭터 명</TableColumn>
                            <TableColumn>이메일</TableColumn>
                            <TableColumn>마지막 로그인 날짜</TableColumn>
                            <TableColumn>원정대</TableColumn>
                            <TableColumn>관리</TableColumn>
                        </TableHeader>
                        <TableBody items={items} emptyContent="검색 결과가 없거나 데이터가 존재하지 않습니다.">
                            {(member) => (
                                <TableRow key={member.docID}>
                                    <TableCell>{member.id}</TableCell>
                                    <TableCell>{member.character}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.loginDate ? member.loginDate.toLocaleString() : '-'}</TableCell>
                                    <TableCell>
                                        <Popover showArrow>
                                            <PopoverTrigger>
                                                <Button
                                                    size="sm"
                                                    color="secondary"
                                                    radius="sm">
                                                    원정대 ({member.expeditions.length})
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <div className="max-w-[calc(100vw-60px)] min-[441px]:w-[440px] pt-2 max-h-[500px] overflow-y-auto">
                                                    <Table
                                                        fullWidth
                                                        removeWrapper>
                                                        <TableHeader>
                                                            <TableColumn>캐릭터명</TableColumn>
                                                            <TableColumn>캐릭터 레벨</TableColumn>
                                                            <TableColumn>클래스</TableColumn>
                                                            <TableColumn>서버</TableColumn>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {member.expeditions.map((character, idx) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>{character.nickname}</TableCell>
                                                                    <TableCell>{character.level}</TableCell>
                                                                    <TableCell>{character.job}</TableCell>
                                                                    <TableCell>{character.server}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            radius="sm"
                                            color="danger"
                                            isLoading={isLoadingButton}
                                            onPress={async () => {
                                                if (confirm('데이터를 삭제하면 복구하실 수 없습니다. 마지막 로그인이로부터 1년 이상인 맴버이거나 삭제 요청이나 삭제 대상이 되는 경우가 아니면 삭제하시지 말아주세요.\n데이터를 정말 삭제하시겠습니까?')) {
                                                    await handleRemoveMember(member.uid, member.id, members, setMembers, setLoadingButton);
                                                }
                                            }}>
                                            삭제
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
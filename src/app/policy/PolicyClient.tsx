'use client'
import { Divider, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";

export default function PolicyClient() {
    return (
        <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
            <h1 className="text-3xl font-bold mt-4 mb-12">로츠고(LOT'S GO) 개인정보 처리방침</h1>
            <p>
                로츠고(이하 "회사"라고 합니다)은 개인정보 보호를 매우 중요시하며, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」(이하 “정보통신망법”), 「개인정보 보호법」 등 관련된 법령상의 개인정보 보호규정을 준수하고 있습니다. 
                회사는 위 관련 법령에 따라 이용자의 개인정보를 보호하고 개인정보 보호를 위하여 아래와 같이 개인정보 처리방침을 명시하며, 이용자의 권익 보호에 최선을 다하겠습니다.
            </p>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보 수집에 대한 동의</h2>
            <Divider/>
            <p className="mt-2">회사는 이용자들이 회사의 개인정보 처리방침 또는 이용약관의 내용에 대하여 회원가입 시 체크박스를 체크하는 방법을 이용하여 체크하면 개인정보 수집에 대해 동의한 것으로 봅니다.</p>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보의 처리 목적</h2>
            <Divider/>
            <div className="mt-2">
                <p>회사는 필요한 한도 내에서 최소한의 개인정보를 수집하며, 수집한 개인정보는 다음의 목적을 위해 사용됩니다.</p>
                <ul className="list-disc pl-4">
                    <li>홈페이지 회원 관리</li>
                    <p>회원제 서비스 이용에 따른 회원 자격 유지, 서비스 부정 이용 및 비인가 사용 방지, 상담 및 문의 처리, 각종 고지/통지 등을 목적으로 개인정보를 처리합니다.</p>
                </ul>
            </div>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보의 처리 및 보유 기간</h2>
            <Divider/>
            <p className="mt-2">
                회사는 법령에 따라 개인정보 보유, 이용 기간 또는 정보 주체로부터 개인정보의 수집 시에 동의 받은 개인정보를 이용 기간 내에서 처리, 보유합니다. 이용 기간 이후는 개인정보는 완전 파기됩니다. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
            </p>
            <ul className="list-disc pl-4 mt-2">
                <li>회사 내부 방침에 따라 보유하는 개인정보의 보유 기간</li>
                <ol className="list-decimal pl-4">
                    <li>서비스 제공을 위해 수집한 정보 : 회원가입 이후 회원탈퇴 또는 불량 회원 강제 탈퇴까지</li>
                    <li>보유 기간 내에 회사와 이용자 간에 분쟁이 발생한 경우에 분쟁이 해결되지 않은 경우 : 분쟁이 해결될 때까지</li>
                </ol>
                <li>관련 법령에 의한 개인정보 보유 기간</li>
                <ol className="list-decimal pl-4">
                    <li>계약 또는 청약철회 등에 관한 기록 : 5년(전자상거래 등에서의 소비자 보호에 관한 법률)</li>
                    <li>대금결제 및 재화 등의 공급에 관한 기록 : 5년(전자상거래 등에서의 소비자보호에 관한 법률)</li>
                    <li>소비자의 불만 또는 분쟁처리에 관한 기록 : 3년(전자상거래 등에서의 소비자보호에 관한 법률)</li>
                </ol>
            </ul>
            <h2 className="mt-4 mb-2 text-2xl font-bold">처리하는 개인정보 항목</h2>
            <Divider/>
            <p className="mt-2">
                회사는 로츠고 이용자 및 서비스 분류에 따라 다음의 개인정보 항목을 수집, 이용, 보유, 파기하고 있습니다. 이용자는 본 조의 항목 제공 동의를 거부할 권리가 있으며, 미동의 시 서비스 가입 및 이용에 제약이 있을 수 있습니다.
            </p>
            <ul className="list-disc pl-4 mt-2">
                <li>필수 수집항목 : 아이디, 비밀번호, 이메일</li>
                <li>선택 수집항목</li>
                <ol className="list-decimal pl-4">
                    <li>IP 주소, 인증 토큰값 : 불량 회원의 부정 이용 방지와 비인가 사용 방지 목적</li>
                    <li>은행계좌정보 - 예금주, 은행명, 계좌번호 : 서비스 또는 부가 서비스 이용에 대한 결제</li>
                </ol>
            </ul>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보 제 3자에 대한 제공</h2>
            <Divider/>
            <p className="mt-2">
                「개인정보 보호법」 제18조에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우에도 개인정보가 제공될 수 있습니다.
            </p>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보의 위탁 처리</h2>
            <Divider/>
            <p className="mt-2">
                서비스는 원활한 개인정보 업무 처리를 위해 다음과 같이 개인정보 처리를 외부에 위탁하고 있습니다.
            </p>
            <ul className="list-disc pl-4 mt-2">
                <li>Google Firebase : 사용자 인증 및 계정 관리 기능 제공</li>
            </ul>
            <h2 className="mt-4 mb-2 text-2xl font-bold">정보 주체의 권리, 의무 및 행사방법</h2>
            <Divider/>
            <ul className="list-disc pl-4 mt-2">
                <li>정보주체는 로츠고 - Lot's go(www.lotsgo.kr)에서 언제든지 개인정보 처리와 관련하여 이하의 권리를 행사할 수 있습니다.</li>
                <ol className="list-decimal pl-4">
                    <li>개인정보 열람, 정정, 삭제의 권리</li>
                    <p>
                        정보주체는 언제든지 등록되어 있는 회원의 개인정보를 열람하거나 정정할 수 있고 개인정보의 삭제를 요구할 수 있습니다.
                        정보주체가 개인정보  열람, 정정 및 삭제를 하고자 할 경우 설정에서 언제든지 개인정보 및 회원 데이터를 삭제하실 수 있습니다.
                    </p>
                    <li>개인정보 처리 정지 요구의 권리</li>
                    <p>
                        정보주체는 언제든지 등록되어 있는 이용자의 개인정보의 처리정지를 요구할 수 있습니다. 
                        개인정보 처리의 정지를 원하는 경우 로츠고의 개인정보보호책임자에게 서면 또는 전자우편으로 연락하는 경우 지체없이 조치하도록 하겠습니다.
                    </p>
                    <li>개인정보 수집, 이용, 제공에 대한 도으이 철회의 권리</li>
                    <p>
                        정보주체는 언제든지 등록되어 있는 회원의 개인정보의 수집, 이용, 제공에 대한 동의를 철회할 수 있습니다.
                        개인정보의 수집, 이용, 제공에 대한 동의를 철회를 원하는 경우 개인정보보호책임자에게 서면 또는 전자우편으로 연락하여 철회를 신청할 수 있습니다.
                        회사에서 본인 확인 절차를 거친 후 개인정보의 삭제 등 필요한 조치를 하겠습니다.
                        다만, 동의를 철회하는 경우에는 일부 또는 전부의 서비스 이용이 불가능하거나 진행 중인 서비스가 중단될 수 있습니다.
                    </p>
                </ol>
                <li>
                    본조 제 1항에 따른 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 진행할 수 있습니다.
                    이러한 경우에는「개인정보 보호법」에서 정한 서식에 따른 위임장을 제출하여야 합니다.
                </li>
            </ul>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보 자동 수집 장치의 설치/운영 및 거부에 관한 사항</h2>
            <Divider/>
            <p className="mt-2">
                회사는 브라우저의 localStorage를 이용하여 로그인 상태 유지를 위한 토큰 또는 일부 사용자 설정값을 저장할 수 있습니다. 해당 정보는 브라우저에만 저장되며 서버로 전송되지 않으며, 사용자가 직접 삭제할 수 있습니다.
            </p>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보의 파기</h2>
            <Divider/>
            <ul className="list-disc pl-4 mt-2">
                <li>회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때는 지체없이 해당 개인정보를 파기합니다.</li>
                <li>정보주체가 동의한 개인정보 보유 기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존되어야 하는 경우에는 법령에 따라 개인정보를 보유합니다.</li>
                <li>개인정보 파기 절차 및 방법은 다음과 같습니다.</li>
                <ol className="list-decimal pl-4">
                    <li>파기 절차</li>
                    <p>
                        수집 · 이용목적이 달성된 개인정보는 지체없이 파기되며, 관련 법령에 따라 보관되어야 할 경우 별도의 DB에 옮겨져 내부 규정 및 관련 법령을 주수하여 일정기간(개인정보의 처리 및 보유기간 참조) 동안 안전하게 보관된 후 지체없이 파기됩니다. 이때, DB로 옮겨진 개인정보는 법률에 의한 경우를 제외하고 다른 목적으로 이용되지 않습니다.
                    </p>
                    <li>파기 방법</li>
                    <p>전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 기록된 개인정보는 분쇄하거나 소각을 통하여 파기합니다.</p>
                </ol>
            </ul>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보의 안정성 확보 조치</h2>
            <Divider/>
            <p className="mt-2">회사는 회원들의 개인정보를 처리함에 있어 개인정보가 분실, 도난, 유출, 위조, 변조 또는 훼손되지 않도록 개인정보의 안정성 확보를 위하여 다음과 같은 대책을 강구하고 있습니다.</p>
            <ul className="list-disc pl-4 mt-2">
                <li>개인정보 취급 담당자의 최소화 및 교육</li>
                <p>개인정보를 취급하는 담당자를 지정하고 관리하고 있으며 담당자를 대상으로 안전한 관리를 위한 교육을 실시하고 있습니다.</p>
                <li>개인정보에 대한 접근 제한</li>
                <p>개인정보를 처리하는 데이터베이스 시스템에 대한 접근권한의 부여를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있습니다.</p>
                <li>개인정보의 암호화</li>
                <p>개인정보는 암호화 등을 통해 안전하게 저장 및 관리되고 있습니다.</p>
                <li>주기적 점검</li>
                <p>개인정보가 유출 및 훼손을 막기 위하여 데이터베이스 시스템을 주기적으로 점검하고 있습니다.</p>
            </ul>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보 보호 책임자 및 개인정보 침해</h2>
            <Divider/>
            <p className="mt-2">
                회사는 개인정보 처리에 관한 업무를 총괄하여 책임지고, 개인정보 처리와 관련한 정보 주체의 불만 처리 및 피해 구제 등을 위하여 아래와 같은 개인정보 보호 담당자, 책임자를 지정하고 있습니다.
                회원의 개인정보와 관련한 문의 사항이 있으면 아래 개인정보 보호 책임자 또는 담장자에게 연락주시기 바랍니다.
            </p>
            <div className="w-full mt-2 overflow-x-auto scrollbar-hide">
                <Table removeWrapper className="w-[700px] max-w-[700px] sm:w-full sm:max-w-full">
                    <TableHeader>
                        <TableColumn>책임자/담당자</TableColumn>
                        <TableColumn>성명</TableColumn>
                        <TableColumn>소속</TableColumn>
                        <TableColumn>이메일</TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow key={0}>
                            <TableCell>책임자</TableCell>
                            <TableCell>박성민</TableCell>
                            <TableCell>Whitetusk 팀장</TableCell>
                            <TableCell>zeratul188@kakao.com</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <p className="mt-2">
                기타 개인정보 침해에 대한 피해 구제, 상담은 아래의 기관에서 문의하실 수 있습니다.
            </p>
            <div className="w-full mt-2 overflow-x-auto scrollbar-hide">
                <Table removeWrapper className="w-[700px] max-w-[700px] sm:w-full sm:max-w-full">
                    <TableHeader>
                        <TableColumn>기관명</TableColumn>
                        <TableColumn>전화번호</TableColumn>
                        <TableColumn>URL</TableColumn>
                    </TableHeader>
                    <TableBody>
                        <TableRow key={0}>
                            <TableCell>개인정보분쟁조정위원회</TableCell>
                            <TableCell>(국번없이) 1833-6972</TableCell>
                            <TableCell>www.kopico.go.kr</TableCell>
                        </TableRow>
                        <TableRow key={1}>
                            <TableCell>개인정보침해신고센터</TableCell>
                            <TableCell>(국번없이) 118</TableCell>
                            <TableCell>privacy.kisa.or.kr</TableCell>
                        </TableRow>
                        <TableRow key={2}>
                            <TableCell>대검찰청 사이버수사과</TableCell>
                            <TableCell>(국번없이) 1301</TableCell>
                            <TableCell>www.spo.go.kr</TableCell>
                        </TableRow>
                        <TableRow key={3}>
                            <TableCell>경찰청 사이버수사국</TableCell>
                            <TableCell>(국번없이) 182</TableCell>
                            <TableCell>cyberbureau.police.go.kr</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <h2 className="mt-4 mb-2 text-2xl font-bold">개인정보 처리방침의 변경</h2>
            <Divider/>
            <p className="mt-2">
                회사의 개인정보 처리방침은 정부의 법률 및 지침의 변경과 당사의 약관 및 내부 정책에 따라 변경될 수 있으며 이를 개정하는 경우, 회사는 변경사항에 대해 개인정보 보호법」 제30조 및 「개인정보 보호법 시행령」 제31조에 따라 개정 내용을 회사 홈페이지(공지사항)를 통해 공개하겠습니다.
            </p>
            <p className="mt-8">게시일 : 2025년 6월 14일</p>
            <p>적용일 : 2025년 6월 29일</p>
        </div>
    )
}
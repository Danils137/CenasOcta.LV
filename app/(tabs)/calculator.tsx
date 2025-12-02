import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shield, 
  AlertTriangle, 
  Car, 
  Clock, 
  Phone, 
  Gauge, 
  Eye, 
  Snowflake,
  CloudRain,
  Moon,
  Wrench,
  BookOpen,
  CheckCircle,
} from 'lucide-react-native';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/constants/translations';

type SafetyCategory = 'rules' | 'tips' | 'emergency' | 'quiz';

type InfoBlock = {
  title?: string;
  paragraphs?: string[];
  bullets?: string[];
  afterBullets?: string[];
};

const infoContentByLanguage: Record<Language, InfoBlock[]> = {
  lv: [
    {
      paragraphs: [
        `Ar Jūsu transportlīdzekli, tostarp elektroskrejriteni, ceļu satiksmes negadījumā nodarītie zaudējumi citu personu mantai (tajā skaitā transportlīdzeklim), veselībai un personai nodarītais nemantiskais kaitējums (atkarībā no valsts, kur noticis ceļu satiksmes negadījums).`,
        `Apdrošināšanas līgums tiek slēgts attiecībā uz transportlīdzekli, kurš ir reģistrēts, reģistrējams vai tiks reģistrēts Latvijas Republikā.`,
      ],
    },
    {
      title: 'Kādi zaudējumi netiek atlīdzināti Latvijā?',
      paragraphs: [
        `Ja ceļu satiksmes negadījums ir noticis Latvijas Republikā, tad netiek atlīdzināti šādi zaudējumi:`,
      ],
      bullets: [
        `Zaudējumi, ko ceļu satiksmes negadījumā ar Jūsu transportlīdzekli esat nodarījis sev vai savai mantai.`,
        `Negūtā peļņa.`,
        `Nenoskaidrota transportlīdzekļa nodarītie zaudējumi, izņemot gadījumus, kad ir cietusi persona (gājējs, pasažieris u.c.).`,
        `Mantai nodarītie zaudējumi, ja tie nav radušies ceļu satiksmes negadījuma brīdī.`,
        `Zaudējumi, ja ceļu satiksmes negadījums noticis sacensību vai treniņbrauciena laikā norobežotā teritorijā publisku pasākumu laikā.`,
        `Zaudējumi citas personas mantai, ja veikts komercpārvadājums.`,
        `Lidlaukā radušies zaudējumi, ja notikusi sadursme ar gaisa kuģi.`,
        `Ar transportlīdzekli, kas izmantots terorakta veikšanā, nodarītie zaudējumi.`,
        `Zaudējumi, kuri nodarīti ar transportlīdzekli, kas negadījuma brīdī nav lietots transporta funkcijai.`,
        `Zaudējumi, ko radījis izkustināts akmens vai cits priekšmets.`,
      ],
      afterBullets: [
        `Izsmeļošu izņēmuma gadījumu uzskaitījumu var atrast Sauszemes transportlīdzekļu īpašnieku civiltiesiskās atbildības obligātās apdrošināšanas likumā.`,
      ],
    },
    {
      paragraphs: [
        `Ja ceļu satiksmes negadījums noticis ārpus Latvijas Republikas, atlīdzināmo zaudējumu veidi un apmēri ir noteikti attiecīgās valsts tiesību aktos.`,
      ],
    },
    {
      title: 'Apdrošināšanas produkta informācija',
      paragraphs: [
        `Apdrošināšanas produkta informācijas dokuments.`,
        `Sabiedrība: Apdrošināšanas akciju sabiedrība.`,
        `Produkts: OCTA standartlīgums.`,
        `Informācija par produktu ir sniegta OCTA standartlīguma polisē un Sauszemes transportlīdzekļu īpašnieku civiltiesiskās atbildības obligātās apdrošināšanas likumā.`,
      ],
    },
    {
      title: 'Kāds ir šis apdrošināšanas veids?',
      paragraphs: [
        `Sauszemes transportlīdzekļu īpašnieku civiltiesiskās atbildības obligātā apdrošināšana (OCTA).`,
      ],
    },
    {
      title: 'Seguma apmērs Latvijā',
      bullets: [
        `Līdz 6 450 000 euro – personai nodarītie zaudējumi neatkarīgi no cietušo personu skaita.`,
        `Līdz 1 300 000 euro – mantai nodarītie zaudējumi neatkarīgi no trešo personu skaita.`,
      ],
    },
    {
      title: 'Atlīdzības pieprasījuma termiņi',
      bullets: [
        `1 gada laikā no ceļu satiksmes negadījuma brīža – par mantai nodarīto zaudējumu.`,
        `3 gadu laikā no ceļu satiksmes negadījuma brīža – par veselībai nodarīto kaitējumu (tai skaitā nemantisko kaitējumu).`,
      ],
      afterBullets: [
        `Ja ceļu satiksmes negadījums noticis ārpus Latvijas Republikas, seguma ierobežojumi ir noteikti attiecīgās valsts tiesību aktos.`,
      ],
    },
    {
      title: 'Kur es esmu apdrošināts?',
      paragraphs: [
        `Eiropas Ekonomikas zonas valstīs, kā arī Andorā, Bosnijā un Hercegovinā, Šveices Konfederācijā, Melnkalnē, Serbijā, Lielbritānijas un Ziemeļīrijas Apvienotajā Karalistē.`,
      ],
    },
    {
      title: 'Kādas ir manas saistības?',
      paragraphs: [
        `Pirms līguma noslēgšanas un līguma darbības laikā sniedziet apdrošinātājam pilnīgu un patiesu informāciju.`,
        `Fiksējot ceļu satiksmes negadījuma apstākļus, ievērojiet tās valsts tiesību aktus, kurā noticis negadījums.`,
        `Ne vēlāk kā 10 dienu laikā pēc ceļu satiksmes negadījuma:`,
      ],
      bullets: [
        `Paziņojiet savam apdrošinātājam par ceļu satiksmes negadījuma iestāšanos.`,
        `Iesniedziet apdrošinātājam aizpildītu Saskaņotā paziņojuma veidlapu, ja negadījums noformēts papīra veidlapā.`,
      ],
    },
    {
      title: 'Kad un kā man jāveic samaksa?',
      paragraphs: [
        `Samaksa par apdrošināšanu jāveic apdrošināšanas līgumā (polisē) noteiktajā kārtībā un apmērā.`,
      ],
    },
    {
      title: 'Kad sākas un beidzas segums?',
      paragraphs: [
        `Apdrošināšanas segums ir spēkā apdrošināšanas līguma darbības laikā.`,
        `Līgums ir spēkā ar līgumā norādīto spēkā stāšanās laiku. Tas izbeidzas automātiski, ja:`,
      ],
      bullets: [
        `Transportlīdzeklim mainās īpašnieks.`,
        `Tiek izsniegta tranzīta numura karte.`,
        `Tiek izsniegtas taksometra numura zīmes.`,
        `Stājas spēkā licences kartīte pasažieru komercpārvadājumiem ar vieglo automobili.`,
        `Tiek izsniegts apliecinājums par transportlīdzekļa norakstīšanu.`,
        `Transportlīdzeklis tiek nodots tirdzniecības uzņēmumam un par to izdarīta atzīme transportlīdzekļu reģistrā.`,
        `Transportlīdzeklis ar Latvijas numura zīmi tiek reģistrēts citā valstī.`,
        `Līzinga gadījumā mainās līzinga ņēmējs.`,
        `Transportlīdzeklim mainās identifikācijas (VIN vai šasijas) numurs.`,
        `Transportlīdzeklis tiek izslēgts no valsts vai pašvaldību transportlīdzekļu reģistra.`,
      ],
    },
    {
      title: 'Kā es varu atcelt līgumu?',
      paragraphs: [
        `Līgumu var izbeigt pirms termiņa, ja tas nav izbeidzies automātiski, iesniedzot pieteikumu apdrošinātājam, piemēram, ja:`,
      ],
      bullets: [
        `Citas personas prettiesiskas darbības dēļ transportlīdzeklis izgājis no Jūsu valdījuma (piemēram, zādzības vai laupīšanas gadījumā) un par to paziņots tiesībaizsardzības iestādei.`,
        `Ir pārtraukta transportlīdzekļa reģistrācija uz laiku.`,
        `Apdrošināšanas līguma informācijā ir kļūda.`,
        `Transportlīdzekļa īpašnieks vai – līzinga gadījumā – turētājs (juridiska persona) tiek likvidēts.`,
        `Tiek mainīts līgumā norādītā transportlīdzekļa īpašnieka vai turētāja nosaukums, vārds vai uzvārds.`,
        `Apdrošinātājam, ar kuru noslēgts līgums, tiek anulēta licence OCTA nodrošināšanai vai uzsākta likvidācija.`,
        `Transportlīdzeklim ir noņemtas taksometra numura zīmes normatīvajos aktos noteiktajā kārtībā.`,
        `Beidzies transportlīdzeklim izsniegtās licences kartītes pasažieru komercpārvadājumiem ar vieglo automobili derīguma termiņš.`,
      ],
    },
  ],
  en: [
    {
      paragraphs: [
        `Losses caused by your vehicle, including an electric scooter, to third-party property (including vehicles), health, and non-material damage (depending on the country where the road traffic accident occurred).`,
        `The insurance contract covers a vehicle that is registered, must be registered, or will be registered in the Republic of Latvia.`,
      ],
    },
    {
      title: 'Losses that are not compensated in Latvia',
      paragraphs: [
        `If a road traffic accident occurs in Latvia, the following losses are not compensated:`,
      ],
      bullets: [
        `Losses you cause to yourself or your own property with your vehicle.`,
        `Lost profit.`,
        `Losses caused by an unidentified vehicle, except when a person (pedestrian, passenger, etc.) is injured.`,
        `Property damage that did not arise at the moment of the accident.`,
        `Losses that occur during competitions or training rides in a cordoned-off area during public events.`,
        `Damage to another person's property while performing commercial transport.`,
        `Losses that arise at an airfield if a collision with an aircraft occurs.`,
        `Losses caused by a vehicle used to carry out a terrorist act.`,
        `Losses caused by a vehicle that, at the time of the accident, was not used for transportation purposes.`,
        `Losses caused by a displaced stone or another object.`,
      ],
      afterBullets: [
        `A full list of exceptions is available in the Latvian Compulsory Civil Liability Insurance Law for Motor Vehicle Owners.`,
      ],
    },
    {
      paragraphs: [
        `If the accident happened outside Latvia, the types and amounts of compensable losses are determined by the legislation of the respective country.`,
      ],
    },
    {
      title: 'Insurance product information',
      paragraphs: [
        `Insurance Product Information Document.`,
        `Insurer: Joint-stock insurance company.`,
        `Product: Standard OCTA contract.`,
        `Product information is provided in the standard OCTA policy and in the Latvian Compulsory Civil Liability Insurance Law for Motor Vehicle Owners.`,
      ],
    },
    {
      title: 'What type of insurance is this?',
      paragraphs: [
        `Compulsory civil liability insurance for owners of motor vehicles (OCTA).`,
      ],
    },
    {
      title: 'Coverage limits in Latvia',
      bullets: [
        `Up to EUR 6,450,000 – compensation for injury to persons, regardless of the number of casualties.`,
        `Up to EUR 1,300,000 – compensation for damage to property, regardless of the number of third parties.`,
      ],
    },
    {
      title: 'Deadlines for submitting claims',
      bullets: [
        `Within 1 year from the date of the accident – for property damage.`,
        `Within 3 years from the date of the accident – for injury to health (including non-material damage).`,
      ],
      afterBullets: [
        `If the accident happened outside Latvia, coverage limits are defined by the legislation of the respective country.`,
      ],
    },
    {
      title: 'Where am I insured?',
      paragraphs: [
        `In the countries of the European Economic Area, as well as Andorra, Bosnia and Herzegovina, Switzerland, Montenegro, Serbia, and the United Kingdom of Great Britain and Northern Ireland.`,
      ],
    },
    {
      title: 'Your obligations',
      paragraphs: [
        `Before and during the contract, provide the insurer with complete and truthful information.`,
        `When documenting a road traffic accident, comply with the laws of the country where it occurred.`,
        `No later than 10 days after the accident:`,
      ],
      bullets: [
        `Notify your insurer about the accident.`,
        `Submit a completed agreed statement form if the accident was documented using the paper form.`,
      ],
    },
    {
      title: 'When and how do I pay?',
      paragraphs: [
        `Insurance premiums must be paid in the manner and amount specified in the policy.`,
      ],
    },
    {
      title: 'When does coverage start and end?',
      paragraphs: [
        `Coverage is valid for the duration of the insurance contract.`,
        `The contract takes effect on the start date shown in the policy and ends automatically if:`,
      ],
      bullets: [
        `The vehicle owner changes.`,
        `A transit number plate is issued.`,
        `Taxi number plates are issued.`,
        `A licence card for passenger transport by car takes effect.`,
        `A certificate of vehicle deregistration is issued.`,
        `The vehicle is handed over to a dealer and the registry is updated accordingly.`,
        `A vehicle with Latvian plates is registered in another country.`,
        `The leasing recipient changes.`,
        `The vehicle’s identification number (VIN or chassis) changes.`,
        `The vehicle is removed from the state or municipal vehicle register.`,
      ],
    },
    {
      title: 'How can I cancel the contract?',
      paragraphs: [
        `You may terminate the contract before expiry (if it has not ended automatically) by submitting a request to the insurer in cases such as:`,
      ],
      bullets: [
        `The vehicle leaves your possession due to unlawful actions by another person (e.g. theft or robbery) and the fact has been reported to law enforcement.`,
        `Vehicle registration has been suspended temporarily.`,
        `The information in the insurance contract contains an error.`,
        `The vehicle owner or, in case of leasing, the holder (legal entity) is being liquidated.`,
        `The name of the owner or holder stated in the contract changes.`,
        `The insurer’s licence to provide OCTA is revoked or the insurer enters liquidation.`,
        `Taxi number plates are removed in accordance with regulations.`,
        `The licence card for passenger transport by car has expired.`,
      ],
    },
  ],
  ru: [
    {
      paragraphs: [
        `Убытки, причинённые вашим транспортным средством, включая электросамокат, имуществу других лиц (включая транспортные средства), их здоровью и нематериальный вред (в зависимости от страны, где произошло ДТП).`,
        `Договор страхования заключается в отношении транспортного средства, которое зарегистрировано, подлежит регистрации или будет зарегистрировано в Латвийской Республике.`,
      ],
    },
    {
      title: 'Убытки, не подлежащие возмещению в Латвии',
      paragraphs: [
        `Если ДТП произошло в Латвии, не возмещаются следующие убытки:`,
      ],
      bullets: [
        `Убытки, причинённые самому себе или своему имуществу вашим транспортным средством.`,
        `Упущенная выгода.`,
        `Убытки, причинённые неустановленным транспортным средством, кроме случаев, когда пострадало лицо (пешеход, пассажир и т.п.).`,
        `Имущественный ущерб, который не возник в момент ДТП.`,
        `Убытки, возникшие во время соревнований или тренировочных заездов на ограждённой территории при проведении публичных мероприятий.`,
        `Ущерб имуществу другого лица при выполнении коммерческих перевозок.`,
        `Убытки, возникшие на аэродроме при столкновении с воздушным судном.`,
        `Убытки, причинённые транспортным средством, использованным для совершения террористического акта.`,
        `Убытки, причинённые транспортным средством, которое в момент ДТП не использовалось для перевозок.`,
        `Убытки, вызванные вылетевшим камнем или другим предметом.`,
      ],
      afterBullets: [
        `Полный перечень исключений изложен в Законе об обязательном страховании гражданской ответственности владельцев наземных транспортных средств.`,
      ],
    },
    {
      paragraphs: [
        `Если ДТП произошло за пределами Латвии, виды и объёмы возмещаемых убытков определяются законодательством соответствующей страны.`,
      ],
    },
    {
      title: 'Информация о страховом продукте',
      paragraphs: [
        `Информационный документ о страховом продукте.`,
        `Страховщик: страховое акционерное общество.`,
        `Продукт: стандартный договор OCTA.`,
        `Информация о продукте указана в полисе стандартного OCTA и Законе об обязательном страховании гражданской ответственности владельцев наземных транспортных средств.`,
      ],
    },
    {
      title: 'Какой это вид страхования?',
      paragraphs: [
        `Обязательное страхование гражданской ответственности владельцев наземных транспортных средств (OCTA).`,
      ],
    },
    {
      title: 'Лимиты покрытия в Латвии',
      bullets: [
        `До 6 450 000 евро – ущерб, причинённый лицам, независимо от количества пострадавших.`,
        `До 1 300 000 евро – ущерб имуществу, независимо от количества третьих лиц.`,
      ],
    },
    {
      title: 'Сроки подачи требований о возмещении',
      bullets: [
        `В течение 1 года с момента ДТП – за ущерб имуществу.`,
        `В течение 3 лет с момента ДТП – за вред здоровью (включая нематериальный вред).`,
      ],
      afterBullets: [
        `Если ДТП произошло за пределами Латвии, ограничения покрытия устанавливаются законодательством соответствующей страны.`,
      ],
    },
    {
      title: 'Где действует страхование?',
      paragraphs: [
        `В странах Европейской экономической зоны, а также в Андорре, Боснии и Герцеговине, Швейцарской Конфедерации, Черногории, Сербии, Соединённом Королевстве Великобритании и Северной Ирландии.`,
      ],
    },
    {
      title: 'Ваши обязанности',
      paragraphs: [
        `До заключения договора и во время его действия предоставляйте страховщику полную и правдивую информацию.`,
        `Фиксируя обстоятельства ДТП, соблюдайте законодательство страны, где произошла авария.`,
        `Не позднее 10 дней после ДТП:`,
      ],
      bullets: [
        `Сообщите своему страховщику о наступлении страхового случая.`,
        `Подайте страховщику заполненный бланк согласованного уведомления, если ДТП оформлено на бумажном бланке.`,
      ],
    },
    {
      title: 'Когда и как платить?',
      paragraphs: [
        `Оплата страховой премии производится в порядке и размере, указанных в договоре (полисе).`,
      ],
    },
    {
      title: 'Когда начинается и заканчивается покрытие?',
      paragraphs: [
        `Страховое покрытие действует в течение срока договора страхования.`,
        `Договор вступает в силу в указанное в полисе время и прекращается автоматически, если:`,
      ],
      bullets: [
        `Меняется владелец транспортного средства.`,
        `Выдаётся транзитный номерной знак.`,
        `Выдаются номерные знаки такси.`,
        `Вступает в силу лицензия на коммерческие пассажирские перевозки легковым автомобилем.`,
        `Выдаётся свидетельство о списании транспортного средства.`,
        `Транспортное средство передаётся торговому предприятию, и это отражено в реестре.`,
        `Транспортное средство с латвийским номером регистрируется в другой стране.`,
        `Меняется лизингополучатель.`,
        `Меняется идентификационный номер транспортного средства (VIN или шасси).`,
        `Транспортное средство исключается из государственного или муниципального реестра транспортных средств.`,
      ],
    },
    {
      title: 'Как расторгнуть договор?',
      paragraphs: [
        `Договор можно расторгнуть досрочно (если он не прекратился автоматически), подав заявление страховщику в случаях, когда:`,
      ],
      bullets: [
        `Вследствие противоправных действий третьих лиц транспортное средство выбыло из вашего владения (например, в случае кражи или разбоя), и об этом сообщено правоохранительным органам.`,
        `Регистрация транспортного средства приостановлена на определённое время.`,
        `В договоре страхования обнаружена ошибка.`,
        `Владелец транспортного средства или, в случае лизинга, держатель (юридическое лицо) ликвидируется.`,
        `Изменяется наименование, имя или фамилия владельца или держателя, указанного в договоре.`,
        `У страховщика, с которым заключён договор, аннулирована лицензия на осуществление OCTA или начата процедура ликвидации.`,
        `С транспортного средства сняты номерные знаки такси в установленном порядке.`,
        `Истёк срок действия лицензии на коммерческие пассажирские перевозки легковым автомобилем.`,
      ],
    },
  ],
};

export default function SafetyDrivingScreen() {
  const { t, language } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<SafetyCategory>('rules');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const infoBlocks = useMemo(
    () => infoContentByLanguage[language] || infoContentByLanguage.lv,
    [language]
  );

  const toggleRule = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };

  const renderDrivingRules = () => (
    <View style={styles.contentSection}>
      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('speed')}
      >
        <View style={styles.ruleHeader}>
          <Gauge size={24} color="#059669" />
          <Text style={styles.ruleTitle}>{t('speedLimits')}</Text>
        </View>
        {expandedRule === 'speed' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('citySpeed')}</Text>
            </View>
            <View style={styles.ruleItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('countrySpeed')}</Text>
            </View>
            <View style={styles.ruleItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('highwaySpeed')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('distance')}
      >
        <View style={styles.ruleHeader}>
          <Car size={24} color="#059669" />
          <Text style={styles.ruleTitle}>{t('safeDistance')}</Text>
        </View>
        {expandedRule === 'distance' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <Clock size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('safeDistanceRule')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('seatbelt')}
      >
        <View style={styles.ruleHeader}>
          <Shield size={24} color="#059669" />
          <Text style={styles.ruleTitle}>{t('seatBelt')}</Text>
        </View>
        {expandedRule === 'seatbelt' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <CheckCircle size={16} color="#10B981" />
              <Text style={styles.ruleText}>{t('seatBeltRule')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('phone')}
      >
        <View style={styles.ruleHeader}>
          <Phone size={24} color="#DC2626" />
          <Text style={styles.ruleTitle}>{t('phoneUsage')}</Text>
        </View>
        {expandedRule === 'phone' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <AlertTriangle size={16} color="#DC2626" />
              <Text style={styles.ruleText}>{t('phoneRule')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.ruleCard} 
        onPress={() => toggleRule('alcohol')}
      >
        <View style={styles.ruleHeader}>
          <AlertTriangle size={24} color="#DC2626" />
          <Text style={styles.ruleTitle}>{t('alcoholLimit')}</Text>
        </View>
        {expandedRule === 'alcohol' && (
          <View style={styles.ruleContent}>
            <View style={styles.ruleItem}>
              <AlertTriangle size={16} color="#DC2626" />
              <Text style={styles.ruleText}>{t('alcoholRule')}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSafetyTips = () => (
    <View style={styles.contentSection}>
      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <CloudRain size={24} color="#3B82F6" />
          <Text style={styles.tipTitle}>{t('weatherTips')}</Text>
        </View>
        <View style={styles.tipContent}>
          <View style={styles.tipItem}>
            <CloudRain size={16} color="#3B82F6" />
            <Text style={styles.tipText}>{t('rainTip')}</Text>
          </View>
          <View style={styles.tipItem}>
            <Snowflake size={16} color="#3B82F6" />
            <Text style={styles.tipText}>{t('snowTip')}</Text>
          </View>
          <View style={styles.tipItem}>
            <Eye size={16} color="#3B82F6" />
            <Text style={styles.tipText}>{t('fogTip')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Moon size={24} color="#6366F1" />
          <Text style={styles.tipTitle}>{t('nightDriving')}</Text>
        </View>
        <View style={styles.tipContent}>
          <View style={styles.tipItem}>
            <Moon size={16} color="#6366F1" />
            <Text style={styles.tipText}>{t('nightTip')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Wrench size={24} color="#F59E0B" />
          <Text style={styles.tipTitle}>{t('tireMaintenance')}</Text>
        </View>
        <View style={styles.tipContent}>
          <View style={styles.tipItem}>
            <Wrench size={16} color="#F59E0B" />
            <Text style={styles.tipText}>{t('tireTip')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmergencyActions = () => (
    <View style={styles.contentSection}>
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <AlertTriangle size={24} color="#DC2626" />
          <Text style={styles.emergencyTitle}>{t('accidentSteps')}</Text>
        </View>
        <View style={styles.emergencyContent}>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>{t('step1')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>{t('step2')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>{t('step3')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>{t('step4')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <Text style={styles.stepText}>{t('step5')}</Text>
          </View>
          <View style={styles.emergencyStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>6</Text>
            </View>
            <Text style={styles.stepText}>{t('step6')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderQuiz = () => (
    <View style={styles.contentSection}>
      <View style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <BookOpen size={32} color="#059669" />
          <Text style={styles.quizTitle}>{t('testYourKnowledge')}</Text>
          <Text style={styles.quizSubtitle}>Проверьте свои знания правил дорожного движения</Text>
        </View>
        <TouchableOpacity style={styles.quizButton}>
          <Text style={styles.quizButtonText}>{t('startQuiz')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case 'rules':
        return renderDrivingRules();
      case 'tips':
        return renderSafetyTips();
      case 'emergency':
        return renderEmergencyActions();
      case 'quiz':
        return renderQuiz();
      default:
        return renderDrivingRules();
    }
  };

  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#059669', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerSection}
      >
        <View style={styles.headerContent}>
          <Shield size={40} color="#fff" />
          <Text style={styles.headerTitle}>
            {t('safetyDriving')}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('safetyDrivingSubtitle')}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.infoContainer}>
        {infoBlocks.map((block, index) => (
          <View key={`info-block-${index}`} style={styles.infoSection}>
            {block.title && (
              <Text style={styles.infoTitle}>{block.title}</Text>
            )}
            {block.paragraphs?.map((paragraph, idx) => {
              const isLastParagraph = idx === block.paragraphs!.length - 1;
              const hasBullets = !!block.bullets && block.bullets.length > 0;
              const hasAfterBullets = !!block.afterBullets && block.afterBullets.length > 0;
              return (
                <Text
                  key={`info-block-${index}-paragraph-${idx}`}
                  style={[
                    styles.infoText,
                    !hasBullets && !hasAfterBullets && isLastParagraph ? styles.infoTextNoMargin : null,
                  ]}
                >
                  {paragraph}
                </Text>
              );
            })}
            {block.bullets?.map((item, bulletIdx) => {
              const isLastBullet = bulletIdx === block.bullets!.length - 1;
              const hasAfterBullets = !!block.afterBullets && block.afterBullets.length > 0;
              return (
                <View
                  key={`info-block-${index}-bullet-${bulletIdx}`}
                  style={[
                    styles.bulletRow,
                    !hasAfterBullets && isLastBullet ? styles.bulletRowNoMargin : null,
                  ]}
                >
                  <Text style={styles.bulletIcon}>{'\u2022'}</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              );
            })}
            {block.afterBullets?.map((paragraph, idx) => (
              <Text
                key={`info-block-${index}-after-${idx}`}
                style={[
                  styles.infoText,
                  idx === block.afterBullets!.length - 1 ? styles.infoTextNoMargin : null,
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.categorySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'rules' && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory('rules')}
          >
            <Shield size={18} color={selectedCategory === 'rules' ? '#fff' : '#6B7280'} />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === 'rules' && styles.categoryChipTextActive
            ]}>
              {t('drivingRules')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'tips' && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory('tips')}
          >
            <Eye size={18} color={selectedCategory === 'tips' ? '#fff' : '#6B7280'} />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === 'tips' && styles.categoryChipTextActive
            ]}>
              {t('safetyTips')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'emergency' && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory('emergency')}
          >
            <AlertTriangle size={18} color={selectedCategory === 'emergency' ? '#fff' : '#6B7280'} />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === 'emergency' && styles.categoryChipTextActive
            ]}>
              {t('emergencyActions')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'quiz' && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory('quiz')}
          >
            <BookOpen size={18} color={selectedCategory === 'quiz' ? '#fff' : '#6B7280'} />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === 'quiz' && styles.categoryChipTextActive
            ]}>
              Тест
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {renderContent()}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },

  // Info Sections
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  infoTextNoMargin: {
    marginBottom: 0,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletRowNoMargin: {
    marginBottom: 0,
  },
  bulletIcon: {
    fontSize: 18,
    lineHeight: 24,
    color: '#059669',
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  
  // Category Selector
  categorySelector: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  
  // Content Section
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  
  // Rule Cards
  ruleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  ruleContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
  },
  
  // Tip Cards
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  tipContent: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 12,
    flex: 1,
    lineHeight: 24,
  },
  
  // Emergency Cards
  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 12,
  },
  emergencyContent: {
    gap: 16,
  },
  emergencyStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
    lineHeight: 24,
  },
  
  // Quiz Cards
  quizCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  quizHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  quizSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  quizButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  
  bottomSpacing: {
    height: 50,
  },
  

});

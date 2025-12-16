import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { getCVData, getPhoneNumber } from '../../services/auth/dataServices';
import { useTheme } from '../context/themeContext';

const stripHtml = (html) => {
    if (!html) return '';
    
    let cleanText = html.replace(/<[^>]*>/g, ''); 
    cleanText = cleanText.replace(/&nbsp;/g, ' ').trim(); 
    
    return cleanText.replace(/\s+/g, ' ').trim(); 
};

const getCourseYear = (course) => {
    return course.startdate && course.startdate > 0 
        ? new Date(course.startdate * 1000).getFullYear() 
        : new Date().getFullYear();
};

// 🚨 FUNCIÓN FINAL Y MEJORADA: MÁS VARIEDAD Y MENOS REPETICIÓN SIN IA 🚨
const generateCompetencyDescription = (course) => {
    const courseTitle = (course.shortname || course.fullname || '');
    
    // Lista A: Sustantivos de Habilidad (Énfasis en lo que se obtuvo)
    const skillNouns = [
        "Desarrollo", "Implementación", "Diseño", "Análisis", "Dominio", 
        "Gestión", "Estrategia", "Optimización", "Evaluación", "Fundamentos"
    ];
    
    // Lista B: Focos del Logro (Énfasis en el área de aplicación)
    const focusNouns = [
        "soluciones complejas", "proyectos específicos del área", "metodologías clave", 
        "principios esenciales", "iniciativas de alto impacto", "desafíos técnicos"
    ];

    // Seleccionamos elementos basándonos en el título del curso (para pseudo-aleatoriedad)
    const skillIndex = courseTitle.toUpperCase().charCodeAt(0) % skillNouns.length;
    const skillNoun = skillNouns[skillIndex];
    
    const focusIndex = courseTitle.length % focusNouns.length;
    const focusNoun = focusNouns[focusIndex];

    
    // Plantillas de CV enfocadas en Certificación y Logro (6 plantillas para mayor variedad)
    const templates = [
        `Certificado en ${courseTitle}, con ${skillNoun.toLowerCase()} avanzado de ${focusNoun}.`,
        `Certificación lograda en ${courseTitle}, aplicando ${skillNoun.toLowerCase()} en la ejecución de ${focusNoun}.`,
        `Certificación completada en ${courseTitle}, enfocada en el ${skillNoun.toLowerCase()} de ${focusNoun}.`,
        `Logro de competencias en ${courseTitle}, validando el ${skillNoun.toLowerCase()} de ${focusNoun}.`,
        `Certificado en ${courseTitle}, lo que avala el ${skillNoun.toLowerCase()} de técnicas para ${focusNoun}.`,
        `Formación especializada en ${courseTitle}, destacando por el ${skillNoun.toLowerCase()} de ${focusNoun}.`
    ];
    
    // Elegimos una plantilla diferente para cada curso
    const templateIndex = (courseTitle.length + courseTitle.toUpperCase().charCodeAt(1) % 3) % templates.length;
    
    return templates[templateIndex];
};


export default function CVGeneratorScreen() {
    const [data, setData] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('No disponible'); 
    const [loading, setLoading] = useState(true);
    const { theme, isDark } = useTheme();
    
    const loadData = useCallback(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // 1. Cargamos el ID del usuario del AsyncStorage
                const userId = await AsyncStorage.getItem("moodleUserId");
                const numericUserId = parseInt(userId);
                
                // 2. Cargamos los datos básicos del CV (la llamada que no falla)
                const cvData = await getCVData(); 
                setData(cvData);
                
                // 3. Cargamos el teléfono por separado (la llamada que puede fallar sin detener el resto)
                if (numericUserId) {
                    const phone = await getPhoneNumber(numericUserId);
                    setPhoneNumber(phone);
                }
                
            } catch (error) {
                Alert.alert("Error de Carga", error.message);
                setData({ userDetails: {}, userCourses: [] }); 
            } finally {
                setLoading(false);
            }
        }
        
        fetchData(); 
    }, []); 

    useFocusEffect(loadData); 

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.text, marginTop: 10 }}>Generando CV...</Text>
            </View>
        );
    }

    const user = data?.userDetails || {};
    const courses = data?.userCourses || [];
    const profileImageUrl = user.profileimageurl || 'https://via.placeholder.com/150'; 
    const PRIMARY_COLOR = isDark ? theme.primary : "#E83E4C"; 
    const SECONDARY_TEXT_COLOR = theme.textSecondary || '#A9A9A9';
    const MAIN_TEXT_COLOR = theme.text || '#1C1C1C';
    
    const userPhone = phoneNumber; 
    const userAddress = user.address || `${user.city || ''}, ${user.country || ''}`.trim().replace(/^, |^,|^, $/g, '') || 'No disponible';

    const skills = courses.map(c => c.shortname.split(' ')[0] || c.fullname).slice(0, 5); 
    
    const renderContactInfo = () => (
        <View style={styles.contactContainer}>
            {/* EMAIL */}
            <View style={styles.contactItem}>
                <Entypo name="mail" size={16} color={MAIN_TEXT_COLOR} style={{ marginRight: 8 }} />
                <Text style={[styles.contactText, { color: MAIN_TEXT_COLOR }]}>{user.email || 'N/A'}</Text>
            </View>
            {/* TELÉFONO - Usando el nuevo estado */}
            <View style={styles.contactItem}>
                <Entypo name="phone" size={16} color={MAIN_TEXT_COLOR} style={{ marginRight: 8 }} />
                <Text style={[styles.contactText, { color: MAIN_TEXT_COLOR }]}>{userPhone}</Text>
            </View>
            {/* DIRECCIÓN */}
            <View style={styles.contactItem}>
                <Entypo name="location-pin" size={16} color={MAIN_TEXT_COLOR} style={{ marginRight: 8 }} />
                <Text style={[styles.contactText, { color: MAIN_TEXT_COLOR }]}>{userAddress}</Text>
            </View>
        </View>
    );

    const renderSection = (title, content) => (
        <View style={styles.cvSection}>
            <Text style={[styles.sectionTitle, { color: MAIN_TEXT_COLOR }]}>{title}</Text>
            <View style={[styles.sectionDivider, { backgroundColor: PRIMARY_COLOR }]} />
            {content}
        </View>
    );
    
    const getCourseDescription = (course) => {
        const cleanedSummary = stripHtml(course.summary);
        
        // Criterio de profesionalismo: existe, es largo, y no contiene saludos.
        const isProfessionalSummary = cleanedSummary 
            && cleanedSummary.length > 10 
            && !cleanedSummary.toLowerCase().includes("bienvenido")
            && !cleanedSummary.toLowerCase().includes("welcome");

        // 1. Prioridad: Resumen del curso si es profesional
        if (isProfessionalSummary) {
            return cleanedSummary.substring(0, 150) + '...';
        }
        
        // 2. Último Recurso: Generar texto profesional con enfoque en logros
        return generateCompetencyDescription(course);
    };

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            {/* CABECERA: Dividida en dos columnas para foto y datos */}
            <View style={styles.headerLayout}>
                
                {/* 1. FOTO DE PERFIL */}
                <View style={styles.photoContainer}>
                    <Image 
                        source={{ uri: profileImageUrl }} 
                        style={[styles.profileImage, { borderColor: PRIMARY_COLOR }]} 
                    />
                </View>

                {/* 2. NOMBRE Y CONTACTO */}
                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: MAIN_TEXT_COLOR }]}>{user.fullname || 'NOMBRE COMPLETO'}</Text>
                    <Text style={[styles.jobTitle, { color: PRIMARY_COLOR }]}>Estudiante / Aspirante Profesional</Text>
                    <View style={[styles.cvHeaderDivider, { borderBottomColor: PRIMARY_COLOR }]} />
                    {renderContactInfo()}
                </View>
            </View>
            
            <View style={{ marginBottom: 30 }} />

            {/* HABILIDADES CLAVE */}
            {renderSection(
                "Habilidades Clave",
                <View style={styles.skillsContainer}>
                    {skills.length > 0 ? (
                        skills.map((skill, index) => (
                            <View key={index} style={[styles.skillTag, { backgroundColor: SECONDARY_TEXT_COLOR + '10', borderColor: SECONDARY_TEXT_COLOR }]}>
                                <Text style={{ color: MAIN_TEXT_COLOR, fontWeight: '500', fontSize: 13 }}>{skill}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ color: SECONDARY_TEXT_COLOR, fontSize: 13 }}>Habilidades no definidas automáticamente.</Text>
                    )}
                </View>
            )}

            {/* EXPERIENCIA EDUCATIVA (Cursos) */}
            {renderSection(
                "Experiencia Educativa",
                courses.length > 0 ? (
                    courses.map((course) => (
                        <View key={course.id} style={styles.cvItem}>
                            <Text style={[styles.cvItemTitle, { color: MAIN_TEXT_COLOR }]}>{course.fullname}</Text>
                            <Text style={[styles.cvItemSubtitle, { color: SECONDARY_TEXT_COLOR }]}>
                                {course.shortname || 'Programa'} | {getCourseYear(course)}
                            </Text>
                            <Text style={[styles.cvItemDescription, { color: SECONDARY_TEXT_COLOR }]}>
                                {getCourseDescription(course)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: SECONDARY_TEXT_COLOR, fontSize: 13 }}>
                        No se pudieron cargar los cursos.
                    </Text>
                )
            )}
            
            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { paddingVertical: 30, paddingHorizontal: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    // --- ESTILOS DE CABECERA FORMAL (2 Columnas) ---
    headerLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
    },
    photoContainer: {
        marginRight: 20,
    },
    profileImage: { 
        width: 100, 
        height: 100, 
        borderRadius: 50, 
        borderWidth: 3, 
    },
    infoContainer: {
        flex: 1, 
    },
    name: { fontSize: 32, fontWeight: '800', marginBottom: 2, }, 
    jobTitle: { fontSize: 16, fontWeight: '500', marginBottom: 10, }, 
    cvHeaderDivider: {
        height: 2,
        width: '100%',
        marginBottom: 10,
        borderBottomWidth: 1,
    },
    
    // --- ESTILOS DE CONTACTO (Más grandes y en columna para claridad) ---
    contactContainer: { 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        marginTop: 5, 
    },
    contactItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginVertical: 4, 
    },
    contactText: { fontSize: 14, fontWeight: '500' }, 
    
    // --- ESTILOS DE SECCIÓN ---
    cvSection: { marginBottom: 30, paddingHorizontal: 0, },
    sectionTitle: { 
        fontSize: 22, 
        fontWeight: '700', 
        marginBottom: 8, 
        textTransform: 'uppercase',
    },
    sectionDivider: {
        height: 3,
        width: 50,
        marginBottom: 20,
    },

    // --- ESTILOS DE ITEM DE CURSO ---
    cvItem: { marginBottom: 20, },
    cvItemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2, },
    cvItemSubtitle: { fontSize: 13, fontStyle: 'italic', marginBottom: 4, },
    cvItemDescription: { fontSize: 14, lineHeight: 20, },

    // --- ESTILOS DE HABILIDADES ---
    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
    skillTag: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, marginRight: 8, marginBottom: 8, borderWidth: 1, }
});
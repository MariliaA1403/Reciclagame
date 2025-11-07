import { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function Cadastro() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null); // 'instituicao' ou 'jogador'

  // Campos Instituição
  const [institutionName, setInstitutionName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionPhone, setInstitutionPhone] = useState('');
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionPassword, setInstitutionPassword] = useState('');
  const [institutionConfirmPassword, setInstitutionConfirmPassword] = useState('');

  // Campos Jogador
  const [userName, setUserName] = useState('');
  const [matricula, setMatricula] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [studentInstitution, setStudentInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Função para renderizar campos obrigatórios padronizados
  const renderField = (placeholder, value, setValue, secure = false) => (
    <View style={{ width: '100%' }}>
      <View style={styles.requiredContainer}>
        <Text style={styles.requiredText}>este campo é obrigatório</Text>
        <Text style={styles.requiredStar}>*</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        value={value}
        onChangeText={setValue}
        secureTextEntry={secure}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={['#C9DFC9', '#95C296']}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.welcome}>Bem-vindo(a) ao ReciclaGame!</Text>

          {/* Tipo */}
          <View style={styles.typeContainer}>
            <View style={styles.typeLabelContainer}>
              <Text style={styles.typeLabel}>Você é Instituição ou Jogador?</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setSelectedType('instituicao')}
              >
                <View style={styles.radioCircle}>
                  {selectedType === 'instituicao' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioText}>Instituição</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setSelectedType('jogador')}
              >
                <View style={styles.radioCircle}>
                  {selectedType === 'jogador' && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioText}>Jogador</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Campos adicionais para Jogador */}
          {selectedType === 'jogador' && (
            <>
              {renderField("Digite seu nome completo", userName, setUserName)}
              {renderField("Digite sua matrícula", matricula, setMatricula)}
              {renderField("Digite sua data de nascimento", birthDate, setBirthDate)}
              {renderField("Digite seu telefone / WhatsApp", phone, setPhone)}
              {renderField("Digite seu endereço", address, setAddress)}
              {renderField("Digite sua instituição", studentInstitution, setStudentInstitution)}
              {renderField("Crie uma senha", password, setPassword, true)}
              {renderField("Confirme a senha", confirmPassword, setConfirmPassword, true)}
            </>
          )}

          {/* Campos adicionais para Instituição */}
          {selectedType === 'instituicao' && (
            <>
              {renderField("Digite o nome da instituição", institutionName, setInstitutionName)}
              {renderField("Digite o CNPJ da instituição", cnpj, setCnpj)}
              {renderField("Digite o email institucional", institutionEmail, setInstitutionEmail)}
              {renderField("Digite o telefone / WhatsApp", institutionPhone, setInstitutionPhone)}
              {renderField("Digite o endereço da instituição", institutionAddress, setInstitutionAddress)}
              {renderField("Crie uma senha", institutionPassword, setInstitutionPassword, true)}
              {renderField("Confirme a senha", institutionConfirmPassword, setInstitutionConfirmPassword, true)}
            </>
          )}

          {/* Botão Cadastrar */}
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/verificar-email')}
          >
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', alignItems: 'center', padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  welcome: { fontSize: 22, fontWeight: 'bold', color: '#000', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, marginBottom: 25, textAlign: 'center' },
  requiredContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 5, marginBottom: 3 },
  requiredText: { fontSize: 12, color: '#000', fontStyle: 'italic' },
  requiredStar: { fontSize: 14, color: 'red', marginLeft: 3 },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  typeContainer: { width: '100%', marginBottom: 20 },
  typeLabelContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 5, marginBottom: 8 },
  typeLabel: { fontSize: 13, color: '#000', fontWeight: '500' },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
  radioOption: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 1, borderColor: '#aaa', alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  radioSelected: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#28a745' },
  radioText: { fontSize: 14, color: '#000' },
  button: { width: '100%', backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginText: { fontSize: 14, color: '#007bff', marginTop: 20, fontStyle: 'italic' },
});

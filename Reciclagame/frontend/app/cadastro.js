import { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, Image, ScrollView, Alert, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';

// URL DO BACKEND
const API_URL = "https://ubiquitous-lamp-69r6gv49x4qqc555p-3000.app.github.dev";

export default function Cadastro() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null);

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
  const [userEmail, setUserEmail] = useState(''); // <- campo de email do jogador
  const [matricula, setMatricula] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [studentInstitution, setStudentInstitution] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Função de cadastro
  const handleRegister = async () => {
    if (!selectedType) {
      Alert.alert("Erro", "Selecione se você é instituição ou jogador.");
      return;
    }

    let body = {};

    if (selectedType === "jogador") {
      if (!userName || !userEmail || !matricula || !birthDate || !phone || !address || !studentInstitution || !password || !confirmPassword) {
        Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Erro", "As senhas não coincidem.");
        return;
      }
      body = {
        tipo: "jogador",
        nome: userName,
        email: userEmail,
        matricula,
        data_nascimento: birthDate,
        telefone: phone,
        endereco: address,
        instituicao: studentInstitution,
        senha: password,
      };
    } else {
      if (!institutionName || !cnpj || !institutionEmail || !institutionPhone || !institutionAddress || !institutionPassword || !institutionConfirmPassword) {
        Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
        return;
      }
      if (institutionPassword !== institutionConfirmPassword) {
        Alert.alert("Erro", "As senhas não coincidem.");
        return;
      }
      body = {
        tipo: "instituicao",
        nome: institutionName,
        cnpj,
        email: institutionEmail,
        telefone: institutionPhone,
        endereco: institutionAddress,
        senha: institutionPassword,
      };
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      console.log("RESPOSTA DO BACKEND (bruta):", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: "Servidor retornou um valor inesperado." };
      }

      if (response.ok) {
        Alert.alert("Sucesso!", data.message || "Cadastro realizado.");
        router.push('/verificar-email');
      } else {
        Alert.alert("Erro", data.message || "Erro ao cadastrar.");
      }

    } catch (error) {
      console.log("💥 ERRO AO CONECTAR:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

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
            <Pressable style={styles.radioOption} onPress={() => setSelectedType('instituicao')}>
              <View style={styles.radioCircle}>
                {selectedType === 'instituicao' && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioText}>Instituição</Text>
            </Pressable>

            <Pressable style={styles.radioOption} onPress={() => setSelectedType('jogador')}>
              <View style={styles.radioCircle}>
                {selectedType === 'jogador' && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioText}>Jogador</Text>
            </Pressable>
          </View>
        </View>

        {/* Jogador */}
        {selectedType === 'jogador' && (
          <>
            {renderField("Digite seu nome completo", userName, setUserName)}
            {renderField("Digite seu email", userEmail, setUserEmail)}
            {renderField("Digite sua matrícula", matricula, setMatricula)}
            {renderField("Digite sua data de nascimento", birthDate, setBirthDate)}
            {renderField("Digite seu telefone / WhatsApp", phone, setPhone)}
            {renderField("Digite seu endereço", address, setAddress)}
            {renderField("Digite sua instituição", studentInstitution, setStudentInstitution)}
            {renderField("Crie uma senha", password, setPassword, true)}
            {renderField("Confirme a senha", confirmPassword, setConfirmPassword, true)}
          </>
        )}

        {/* Instituição */}
        {selectedType === 'instituicao' && (
          <>
            {renderField("Digite o nome da instituição", institutionName, setInstitutionName)}
            {renderField("Digite o CNPJ", cnpj, setCnpj)}
            {renderField("Digite o email institucional", institutionEmail, setInstitutionEmail)}
            {renderField("Digite o telefone", institutionPhone, setInstitutionPhone)}
            {renderField("Digite o endereço", institutionAddress, setInstitutionAddress)}
            {renderField("Crie uma senha", institutionPassword, setInstitutionPassword, true)}
            {renderField("Confirme a senha", institutionConfirmPassword, setInstitutionConfirmPassword, true)}
          </>
        )}

        <Pressable style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/')}>
          <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, alignItems: 'center', backgroundColor: '#fff' },
  container: { width: '90%', alignItems: 'center', padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 10 },
  welcome: { fontSize: 22, fontWeight: 'bold', marginBottom: 25 },
  requiredContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 5, marginBottom: 3 },
  requiredText: { fontSize: 12, color: '#000', fontStyle: 'italic' },
  requiredStar: { fontSize: 14, color: 'red', marginLeft: 3 },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#ccc' },
  typeContainer: { width: '100%', marginBottom: 20 },
  typeLabelContainer: { flexDirection: 'row', marginLeft: 5, marginBottom: 8 },
  typeLabel: { fontSize: 13, fontWeight: '500' },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  radioOption: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 1, borderColor: '#aaa', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  radioSelected: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#28a745' },
  radioText: { fontSize: 14 },
  button: { width: '100%', backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginText: { fontSize: 14, color: '#007bff', marginTop: 20, fontStyle: 'italic' },
});


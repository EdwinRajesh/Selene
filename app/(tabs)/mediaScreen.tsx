import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  ActivityIndicator, 
  Modal, 
  TouchableOpacity,
  SectionList,
  TextInput
} from "react-native";
import { FIRESTORE_DB, FIREBASE_AUTH } from "@/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

const MediaScreen1 = () => {
  const [mediaSections, setMediaSections] = useState<any[]>([]);
  const [rawMediaList, setRawMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  // We track the section and overall (flattened) item index for the modal
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Helper: chunk array into subarrays of specified size (here: 3)
  const chunkArray = (array: any[], size: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  // Group media items by uploadDate and filter by tag search
  const groupMediaItems = (mediaList: any[]) => {
    // If a search query exists, filter by tag matching.
    // Here we assume that each media item may have a tags property (an array of strings).
    const filtered = searchQuery
      ? mediaList.filter((item) =>
          item.tags &&
          item.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      : mediaList;
    // Group media items by uploadDate
    const grouped = filtered.reduce((acc, item) => {
      const date = item.uploadDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as { [key: string]: any[] });

    // Convert the grouped object into sections and chunk items into rows of 3
    let sections = Object.keys(grouped).map((date) => ({
      title: date,
      data: chunkArray(grouped[date], 3)
    }));

    // Sort sections in descending order (most recent at the top)
    sections.sort((a, b) =>
      moment(b.title, "DD MMMM YYYY").valueOf() - moment(a.title, "DD MMMM YYYY").valueOf()
    );
    return sections;
  };

  useEffect(() => {
    const fetchMedia = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const journalsRef = collection(FIRESTORE_DB, "users", userId, "journals");
        const snapshot = await getDocs(journalsRef);
        const mediaList: any[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const uploadDate = data.date || "Unknown Date";
          // Incorporate the journal-level tags (if any) into each media item
          const entryTags = data.tags || [];
          if (data.media && Array.isArray(data.media)) {
            data.media.forEach((item: any) => {
              mediaList.push({ 
                ...item, 
                journalId: docSnapshot.id, 
                uploadDate, 
                tags: entryTags 
              });
            });
          }
        });
        // Save the full unfiltered media list
        setRawMediaList(mediaList);
        // Group and set media sections initially
        const sections = groupMediaItems(mediaList);
        setMediaSections(sections);
      } catch (error) {
        console.error("Error fetching media: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [userId]);

  // Update media sections when the search query or raw media list changes.
  useEffect(() => {
    const sections = groupMediaItems(rawMediaList);
    setMediaSections(sections);
  }, [searchQuery, rawMediaList]);

  // Open modal for a specific section, row, and column
  const openModal = (sectionIndex: number, rowIndex: number, columnIndex: number) => {
    const overallIndex = rowIndex * 3 + columnIndex;
    setCurrentSectionIndex(sectionIndex);
    setCurrentItemIndex(overallIndex);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const goPrevious = () => {
    const currentSection = mediaSections[currentSectionIndex];
    if (!currentSection) return;
    const flattened = currentSection.data.flat();
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection = mediaSections[currentSectionIndex - 1];
      const prevFlattened = prevSection.data.flat();
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentItemIndex(prevFlattened.length - 1);
    }
  };

  const goNext = () => {
    const currentSection = mediaSections[currentSectionIndex];
    if (!currentSection) return;
    const flattened = currentSection.data.flat();
    if (currentItemIndex < flattened.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else if (currentSectionIndex < mediaSections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentItemIndex(0);
    }
  };

  // Render a row of media items (each row is an array of up to 3 items)
  const renderMediaRow = ({ item, index, section }: any) => {
    const { width } = Dimensions.get("window");
    // For a container with padding, calculate item size so that 3 items fit in one row.
    const itemSize = (width - 40) / 3;
    return (
      <View style={styles.row}>
        {item.map((mediaItem: any, idx: number) => (
          <TouchableOpacity
            key={idx}
            onPress={() => {
              const sectionIndex = mediaSections.findIndex(s => s.title === section.title);
              openModal(sectionIndex, index, idx);
            }}
          >
            {mediaItem.type === "image" ? (
              <Image
                source={{ uri: mediaItem.url }}
                style={[styles.mediaItem, { width: itemSize, height: itemSize }]}
                resizeMode="cover"
              />
            ) : mediaItem.type === "video" ? (
              <View style={[styles.mediaItem, { width: itemSize, height: itemSize }]}>
                <Video
                  source={{ uri: mediaItem.url }}
                  style={styles.videoThumbnail}
                  useNativeControls={false}
                  resizeMode="cover"
                  isLooping
                />
                <View style={styles.videoOverlay}>
                  <Text style={styles.videoText}>Video</Text>
                </View>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render section header; label as "Today" or "Yesterday" if applicable.
  const renderSectionHeader = ({ section }: any) => {
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "day").startOf("day");
    const sectionDate = moment(section.title, "DD MMMM YYYY");
    let headerLabel = section.title;
    if (sectionDate.isSame(today, "day")) {
      headerLabel = "Today";
    } else if (sectionDate.isSame(yesterday, "day")) {
      headerLabel = "Yesterday";
    }
    return <Text style={styles.sectionHeader}>{headerLabel}</Text>;
  };

  // Render the full-screen media view inside the modal.
  const renderFullScreenMedia = () => {
    const currentSection = mediaSections[currentSectionIndex];
    if (!currentSection) return null;
    const flattened = currentSection.data.flat();
    const currentItem = flattened[currentItemIndex];
    if (!currentItem) return null;
    return currentItem.type === "image" ? (
      <Image
        source={{ uri: currentItem.url }}
        style={styles.fullScreenMedia}
        resizeMode="contain"
      />
    ) : currentItem.type === "video" ? (
      <Video
        source={{ uri: currentItem.url }}
        style={styles.fullScreenMedia}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />
    ) : null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>My Media</Text>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by tag..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : mediaSections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No media uploaded yet.</Text>
        </View>
      ) : (
        <SectionList
          sections={mediaSections}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMediaRow}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.modalContent}>{renderFullScreenMedia()}</View>
          <TouchableOpacity style={styles.leftArrow} onPress={goPrevious}>
            <Ionicons name="arrow-back" size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.rightArrow} onPress={goNext}>
            <Ionicons name="arrow-forward" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    fontSize: 24,
    padding: 20,
    fontFamily: "firamedium",
    color: "#001011",
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  searchInput: {
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#000",
  },
  loader: {
    marginTop: 20,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontFamily: "firamedium",
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "black",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 5,
  },
  mediaItem: {
    marginVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  videoText: {
    color: "white",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "black",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenMedia: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  leftArrow: {
    position: "absolute",
    left: 20,
    top: "50%",
    marginTop: -20,
    zIndex: 10,
  },
  rightArrow: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -20,
    zIndex: 10,
  },
});

export default MediaScreen1;